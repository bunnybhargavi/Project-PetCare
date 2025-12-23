package com.pets.petcare.controller;

import com.pets.petcare.dto.OrderRequest;
import com.pets.petcare.dto.OrderResponse;
import com.pets.petcare.entity.Order;
import com.pets.petcare.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * Create order from cart
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        
        log.info("Creating order for user: {}", authentication.getName());
        OrderResponse response = orderService.createOrderFromCart(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get user's orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        log.info("Fetching orders for user: {}", authentication.getName());
        List<OrderResponse> orders = orderService.getOrdersByUser(authentication.getName());
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get vendor's orders
     */
    @GetMapping("/vendor/orders")
    public ResponseEntity<List<OrderResponse>> getVendorOrders(Authentication authentication) {
        log.info("Fetching orders for vendor: {}", authentication.getName());
        List<OrderResponse> orders = orderService.getOrdersForVendor(authentication.getName());
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get order by ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {
        
        log.info("Fetching order by ID: {}", orderId);
        OrderResponse order = orderService.getOrderById(orderId, authentication.getName());
        return ResponseEntity.ok(order);
    }
    
    /**
     * Update order status (Vendor only)
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status,
            Authentication authentication) {
        
        log.info("Updating order ID: {} to status: {}", orderId, status);
        OrderResponse response = orderService.updateOrderStatus(orderId, status, authentication.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cancel order
     */
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        
        log.info("Cancelling order ID: {}", orderId);
        OrderResponse response = orderService.cancelOrder(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get vendor order statistics
     */
    @GetMapping("/vendor/stats")
    public ResponseEntity<OrderService.VendorOrderStats> getVendorOrderStats(Authentication authentication) {
        log.info("Fetching vendor order statistics for: {}", authentication.getName());
        OrderService.VendorOrderStats stats = orderService.getVendorOrderStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }
}