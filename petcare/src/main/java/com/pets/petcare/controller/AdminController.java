package com.pets.petcare.controller;

import com.pets.petcare.dto.AdminStatsResponse;
import com.pets.petcare.entity.Order;
import com.pets.petcare.entity.Product;
import com.pets.petcare.service.AdminService;
import com.pets.petcare.service.OrderService;
import com.pets.petcare.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private OrderService orderService;

    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    /**
     * Get all products for admin management
     */
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProductsForAdmin());
    }

    /**
     * Update product status (activate/deactivate)
     */
    @PutMapping("/products/{productId}/status")
    public ResponseEntity<Product> updateProductStatus(
            @PathVariable Long productId,
            @RequestParam Boolean isActive) {
        return ResponseEntity.ok(productService.updateProductStatus(productId, isActive));
    }

    /**
     * Get all orders for admin management
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }

    /**
     * Update order status
     */
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    /**
     * Get orders by status
     */
    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    /**
     * Get vendor statistics
     */
    @GetMapping("/vendors/{vendorId}/stats")
    public ResponseEntity<AdminStatsResponse> getVendorStats(@PathVariable Long vendorId) {
        return ResponseEntity.ok(adminService.getVendorStats(vendorId));
    }
}