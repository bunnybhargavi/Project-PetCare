package com.pets.petcare.service;

import com.pets.petcare.dto.OrderRequest;
import com.pets.petcare.dto.OrderResponse;
import com.pets.petcare.entity.*;
import com.pets.petcare.exception.ResourceNotFoundException;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    
    /**
     * Create order from cart
     */
    public OrderResponse createOrderFromCart(OrderRequest request, String userEmail) {
        log.info("Creating order from cart for user: {}", userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(Order.OrderStatus.PLACED);
        
        // Calculate total and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order savedOrder = orderRepository.save(order);
        
        for (CartItem cartItem : cartItems) {
            // Check stock availability
            if (cartItem.getProduct().getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + cartItem.getProduct().getTitle());
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            
            BigDecimal itemTotal = cartItem.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
            
            // Reduce stock
            productService.reduceStock(cartItem.getProduct().getId(), cartItem.getQuantity());
        }
        
        // Update order total
        savedOrder.setTotalAmount(totalAmount);
        savedOrder = orderRepository.save(savedOrder);
        
        // Clear cart
        cartItemRepository.deleteByCart(cart);
        
        log.info("Order created successfully with ID: {}", savedOrder.getId());
        return convertToResponse(savedOrder);
    }
    
    /**
     * Get orders by user
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(String userEmail) {
        log.info("Fetching orders for user: {}", userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get orders for vendor
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForVendor(String vendorEmail) {
        log.info("Fetching orders for vendor: {}", vendorEmail);
        
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        
        List<Order> orders = orderRepository.findOrdersForVendor(vendor);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, String userEmail) {
        log.info("Fetching order by ID: {} for user: {}", orderId, userEmail);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify user access
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You can only view your own orders");
        }
        
        return convertToResponse(order);
    }
    
    /**
     * Update order status
     */
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status, String vendorEmail) {
        log.info("Updating order ID: {} to status: {} by vendor: {}", orderId, status, vendorEmail);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify vendor has products in this order
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        
        boolean hasVendorProducts = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getVendor().equals(vendor));
        
        if (!hasVendorProducts) {
            throw new RuntimeException("You can only update orders containing your products");
        }
        
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        log.info("Order status updated successfully: {}", orderId);
        return convertToResponse(updatedOrder);
    }
    
    /**
     * Cancel order
     */
    public OrderResponse cancelOrder(Long orderId, String userEmail) {
        log.info("Cancelling order ID: {} by user: {}", orderId, userEmail);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify user ownership
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You can only cancel your own orders");
        }
        
        // Check if order can be cancelled
        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED ||
            order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order cannot be cancelled in current status: " + order.getStatus());
        }
        
        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        
        log.info("Order cancelled successfully: {}", orderId);
        return convertToResponse(cancelledOrder);
    }
    
    /**
     * Get vendor statistics
     */
    @Transactional(readOnly = true)
    public VendorOrderStats getVendorOrderStats(String vendorEmail) {
        log.info("Fetching vendor order statistics for: {}", vendorEmail);
        
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        
        long totalOrders = orderRepository.countOrdersForVendor(vendor);
        long pendingOrders = orderRepository.countPendingOrdersForVendor(vendor);
        
        List<Order.OrderStatus> revenueStatuses = List.of(
                Order.OrderStatus.PAID, 
                Order.OrderStatus.PACKED, 
                Order.OrderStatus.SHIPPED, 
                Order.OrderStatus.DELIVERED
        );
        
        BigDecimal totalRevenue = orderRepository.calculateVendorRevenue(vendor, revenueStatuses);
        
        return VendorOrderStats.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .build();
    }
    
    /**
     * Convert Order entity to OrderResponse DTO
     */
    private OrderResponse convertToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentId(order.getPaymentId())
                .trackingNumber(order.getTrackingNumber())
                .orderItems(order.getOrderItems().stream()
                        .map(this::convertOrderItemToResponse)
                        .collect(Collectors.toList()))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert OrderItem to response
     */
    private OrderResponse.OrderItemResponse convertOrderItemToResponse(OrderItem item) {
        return OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productTitle(item.getProduct().getTitle())
                .productImageUrl(item.getProduct().getImageUrl())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .build();
    }
    
    /**
     * Get all orders for admin
     */
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersForAdmin() {
        log.info("Fetching all orders for admin");
        return orderRepository.findAll();
    }
    
    /**
     * Update order status (admin)
     */
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        log.info("Admin updating order ID: {} to status: {}", orderId, status);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        order.setStatus(status);
        return orderRepository.save(order);
    }
    
    /**
     * Get orders by status
     */
    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        log.info("Fetching orders by status: {}", status);
        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    /**
     * Vendor Order Statistics DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class VendorOrderStats {
        private long totalOrders;
        private long pendingOrders;
        private BigDecimal totalRevenue;
    }
}