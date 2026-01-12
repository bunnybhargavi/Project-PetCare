package com.pets.petcare.controller;

import com.pets.petcare.dto.ApiResponse;
import com.pets.petcare.dto.CheckoutRequest;
import com.pets.petcare.dto.OrderResponse;
import com.pets.petcare.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    /**
     * Create order (checkout)
     */
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestBody CheckoutRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            OrderResponse order = orderService.createOrder(userEmail, request);
            return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
        } catch (Exception e) {
            e.printStackTrace(); // Log error to terminal
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    /**
     * Get user orders
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Page<OrderResponse> orders = orderService.getUserOrders(userEmail, page, size);
            return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get orders: " + e.getMessage()));
        }
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            OrderResponse order = orderService.getOrderById(userEmail, orderId);
            return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get order: " + e.getMessage()));
        }
    }

    /**
     * Get order by order number
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(
            @PathVariable String orderNumber,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            OrderResponse order = orderService.getOrderByNumber(userEmail, orderNumber);
            return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get order: " + e.getMessage()));
        }
    }

    /**
     * Cancel order
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            OrderResponse order = orderService.cancelOrder(userEmail, orderId);
            return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to cancel order: " + e.getMessage()));
        }
    }
}