package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.entity.Vendor;
import com.pets.petcare.service.VendorService;
import com.pets.petcare.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VendorController {
    
    private final VendorService vendorService;
    private final ProductService productService;
    
    // VENDOR REGISTRATION - OTP FLOW
    
    @PostMapping("/register/initiate")
    public ResponseEntity<ApiResponse<Void>> initiateVendorRegistration(@Valid @RequestBody VendorRequest request) {
        try {
            ApiResponse<Void> response = vendorService.initiateVendorRegistration(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initiating vendor registration: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to initiate registration: " + e.getMessage()));
        }
    }
    
    @PostMapping("/register/complete")
    public ResponseEntity<ApiResponse<VendorResponse>> completeVendorRegistration(@Valid @RequestBody VendorRequest request) {
        try {
            VendorResponse vendor = vendorService.completeVendorRegistration(request);
            return ResponseEntity.ok(ApiResponse.success("Vendor registered successfully. Awaiting approval.", vendor));
        } catch (Exception e) {
            log.error("Error completing vendor registration: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to complete registration: " + e.getMessage()));
        }
    }
    
    // VENDOR LOGIN - OTP FLOW
    
    @PostMapping("/login/initiate")
    public ResponseEntity<ApiResponse<Void>> initiateVendorLogin(@Valid @RequestBody VendorLoginRequest request) {
        try {
            ApiResponse<Void> response = vendorService.initiateVendorLogin(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initiating vendor login: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to initiate login: " + e.getMessage()));
        }
    }
    
    @PostMapping("/login/complete")
    public ResponseEntity<ApiResponse<VendorResponse>> completeVendorLogin(@Valid @RequestBody VendorLoginRequest request) {
        try {
            VendorResponse vendor = vendorService.completeVendorLogin(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", vendor));
        } catch (Exception e) {
            log.error("Error completing vendor login: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }
    
    // LEGACY ENDPOINTS - Keep for backward compatibility but mark as deprecated
    
    @Deprecated
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<VendorResponse>> registerVendor(@Valid @RequestBody VendorRequest request) {
        // Redirect to new OTP flow
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Please use /register/initiate and /register/complete endpoints for OTP-based registration"));
    }

    @Deprecated
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<VendorResponse>> loginVendor(@Valid @RequestBody VendorLoginRequest request) {
        // Redirect to new OTP flow
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Please use /login/initiate and /login/complete endpoints for OTP-based login"));
    }
    
    @GetMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<VendorResponse>> getVendor(@PathVariable Long vendorId) {
        try {
            VendorResponse vendor = vendorService.getVendorById(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Vendor retrieved successfully", vendor));
        } catch (Exception e) {
            log.error("Error retrieving vendor: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve vendor: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<VendorResponse>> updateVendorProfile(
            @PathVariable Long vendorId, 
            @Valid @RequestBody VendorRequest request) {
        try {
            VendorResponse vendor = vendorService.updateVendorProfile(vendorId, request);
            return ResponseEntity.ok(ApiResponse.success("Vendor profile updated successfully", vendor));
        } catch (Exception e) {
            log.error("Error updating vendor profile: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update vendor profile: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{vendorId}/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVendorDashboard(@PathVariable Long vendorId) {
        try {
            Map<String, Object> stats = vendorService.getVendorDashboardStats(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", stats));
        } catch (Exception e) {
            log.error("Error retrieving vendor dashboard: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve dashboard data: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{vendorId}/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getVendorProducts(@PathVariable Long vendorId) {
        try {
            List<ProductResponse> products = vendorService.getVendorProducts(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
        } catch (Exception e) {
            log.error("Error retrieving vendor products: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve products: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{vendorId}/products")
    public ResponseEntity<ApiResponse<ProductResponse>> createVendorProduct(
            @PathVariable Long vendorId, 
            @Valid @RequestBody ProductRequest request) {
        try {
            ProductResponse product = vendorService.createVendorProduct(vendorId, request);
            return ResponseEntity.ok(ApiResponse.success("Product created successfully", product));
        } catch (Exception e) {
            log.error("Error creating vendor product: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create product: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{vendorId}/products/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateVendorProduct(
            @PathVariable Long vendorId,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request) {
        try {
            ProductResponse product = vendorService.updateVendorProduct(vendorId, productId, request);
            return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
        } catch (Exception e) {
            log.error("Error updating vendor product: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update product: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{vendorId}/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteVendorProduct(
            @PathVariable Long vendorId,
            @PathVariable Long productId) {
        try {
            vendorService.deleteVendorProduct(vendorId, productId);
            return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting vendor product: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete product: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{vendorId}/orders")
    public ResponseEntity<ApiResponse<List<VendorOrderResponse>>> getVendorOrders(@PathVariable Long vendorId) {
        try {
            List<VendorOrderResponse> orders = vendorService.getVendorOrders(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
        } catch (Exception e) {
            log.error("Error retrieving vendor orders: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve orders: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{vendorId}/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<VendorOrderResponse>> updateOrderStatus(
            @PathVariable Long vendorId,
            @PathVariable Long orderId,
            @RequestParam String status) {
        try {
            VendorOrderResponse order = vendorService.updateOrderStatus(vendorId, orderId, status);
            return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
        } catch (Exception e) {
            log.error("Error updating order status: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update order status: " + e.getMessage()));
        }
    }
    
    // Admin endpoints
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<VendorResponse>>> getAllVendors(Pageable pageable) {
        try {
            Page<VendorResponse> vendors = vendorService.getAllVendors(pageable);
            return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", vendors));
        } catch (Exception e) {
            log.error("Error retrieving vendors: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve vendors: " + e.getMessage()));
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<VendorResponse>>> getActiveVendors() {
        try {
            List<VendorResponse> vendors = vendorService.getActiveVendors();
            return ResponseEntity.ok(ApiResponse.success("Active vendors retrieved successfully", vendors));
        } catch (Exception e) {
            log.error("Error retrieving active vendors: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve active vendors: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{vendorId}/status")
    public ResponseEntity<ApiResponse<VendorResponse>> updateVendorStatus(
            @PathVariable Long vendorId, 
            @RequestParam Vendor.VendorStatus status) {
        try {
            VendorResponse vendor = vendorService.updateVendorStatus(vendorId, status);
            return ResponseEntity.ok(ApiResponse.success("Vendor status updated successfully", vendor));
        } catch (Exception e) {
            log.error("Error updating vendor status: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update vendor status: " + e.getMessage()));
        }
    }
}