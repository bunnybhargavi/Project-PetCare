package com.pets.petcare.service;

import com.pets.petcare.dto.CheckoutRequest;
import com.pets.petcare.dto.OrderResponse;
import com.pets.petcare.dto.ProductResponse;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    /**
     * Create order from cart (checkout)
     */
    @Transactional
    public OrderResponse createOrder(String userEmail, CheckoutRequest request) {
        User user = getUserByEmail(userEmail);
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Please add items to your cart before checkout.");
        }

        // Validate all cart items and stock availability
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            // Check if product still exists and is active
            if (!product.getActive()) {
                throw new RuntimeException("Product '" + product.getTitle() + "' is no longer available");
            }
            
            // Check stock availability
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product '" + product.getTitle() + 
                    "'. Available: " + product.getStock() + ", Requested: " + cartItem.getQuantity());
            }
            
            // Validate price hasn't changed significantly (more than 10%)
            BigDecimal currentPrice = product.getDiscountedPrice();
            BigDecimal cartPrice = cartItem.getUnitPrice();
            BigDecimal priceDifference = currentPrice.subtract(cartPrice).abs();
            BigDecimal priceChangePercentage = priceDifference.divide(cartPrice, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            
            if (priceChangePercentage.compareTo(BigDecimal.valueOf(10)) > 0) {
                throw new RuntimeException("Price for product '" + product.getTitle() + 
                    "' has changed significantly. Please refresh your cart and try again.");
            }
        }

        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);

        // Set shipping information
        order.setShippingName(request.getShippingName());
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingCity(request.getShippingCity());
        order.setShippingState(request.getShippingState());
        order.setShippingZipCode(request.getShippingZipCode());
        order.setShippingPhone(request.getShippingPhone());

        // Set payment information
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(Order.PaymentStatus.PENDING);

        // Calculate totals with current prices
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            BigDecimal currentPrice = cartItem.getProduct().getDiscountedPrice();
            BigDecimal itemTotal = currentPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        BigDecimal shippingCost = calculateShippingCost(subtotal);
        BigDecimal tax = calculateTax(subtotal);
        BigDecimal totalAmount = subtotal.add(shippingCost).add(tax);

        order.setSubtotal(subtotal);
        order.setShippingCost(shippingCost);
        order.setTax(tax);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Create order items and reserve stock atomically
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            // Double-check stock before reserving (race condition protection)
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Stock changed during checkout for product: " + product.getTitle());
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getDiscountedPrice()); // Use current price
            orderItem.setTotalPrice(product.getDiscountedPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            orderItemRepository.save(orderItem);

            // Reserve stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Clear cart only after successful order creation
        cartItemRepository.deleteByCart(cart);

        log.info("Order created: {} for user: {} with {} items", 
            savedOrder.getOrderNumber(), userEmail, cartItems.size());

        return mapToResponse(savedOrder);
    }

    /**
     * Get user orders
     */
    public Page<OrderResponse> getUserOrders(String userEmail, int page, int size) {
        User user = getUserByEmail(userEmail);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get order by ID
     */
    public OrderResponse getOrderById(String userEmail, Long orderId) {
        User user = getUserByEmail(userEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Order does not belong to user");
        }

        return mapToResponse(order);
    }

    /**
     * Get order by order number
     */
    public OrderResponse getOrderByNumber(String userEmail, String orderNumber) {
        User user = getUserByEmail(userEmail);
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Order does not belong to user");
        }

        return mapToResponse(order);
    }

    /**
     * Cancel order
     */
    @Transactional
    public OrderResponse cancelOrder(String userEmail, Long orderId) {
        User user = getUserByEmail(userEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Order does not belong to user");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING &&
                order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order cannot be cancelled");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        // Restore product stock
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem orderItem : orderItems) {
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepository.save(product);
        }

        log.info("Order cancelled: {} for user: {}", order.getOrderNumber(), userEmail);

        return mapToResponse(savedOrder);
    }

    /**
     * Generate unique order number
     */
    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "ORD-" + timestamp + "-" + (int) (Math.random() * 1000);
    }

    /**
     * Calculate shipping cost
     */
    private BigDecimal calculateShippingCost(BigDecimal subtotal) {
        // Free shipping for orders over $50
        if (subtotal.compareTo(BigDecimal.valueOf(50)) >= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(5.99); // Standard shipping
    }

    /**
     * Calculate tax
     */
    private BigDecimal calculateTax(BigDecimal subtotal) {
        // 8% tax rate
        return subtotal.multiply(BigDecimal.valueOf(0.08));
    }

    /**
     * Get user by email
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Map Order to OrderResponse
     */
    private OrderResponse mapToResponse(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

        List<OrderResponse.OrderItemResponse> itemResponses = orderItems.stream()
                .map(this::mapOrderItemToResponse)
                .collect(Collectors.toList());

        int totalItemsCount = orderItems.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .items(itemResponses)
                .subtotal(order.getSubtotal())
                .shippingCost(order.getShippingCost())
                .tax(order.getTax())
                .totalAmount(order.getTotalAmount())
                .totalItems(totalItemsCount)
                .shippingName(order.getShippingName())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingZipCode(order.getShippingZipCode())
                .shippingPhone(order.getShippingPhone())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .paymentTransactionId(order.getPaymentTransactionId())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Map OrderItem to OrderItemResponse
     */
    private OrderResponse.OrderItemResponse mapOrderItemToResponse(OrderItem orderItem) {
        ProductResponse productResponse = productService.getProductById(orderItem.getProduct().getId());

        return OrderResponse.OrderItemResponse.builder()
                .id(orderItem.getId())
                .product(productResponse)
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .totalPrice(orderItem.getTotalPrice())
                .build();
    }

    // Admin methods for AdminService compatibility

    /**
     * Get all orders for admin management
     */
    public List<Order> getAllOrdersForAdmin() {
        return orderRepository.findAll();
    }

    /**
     * Update order status
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setStatus(status);

        // Set timestamps based on status
        if (status == Order.OrderStatus.SHIPPED && order.getShippedAt() == null) {
            order.setShippedAt(LocalDateTime.now());
        } else if (status == Order.OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        return orderRepository.save(order);
    }

    /**
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
}