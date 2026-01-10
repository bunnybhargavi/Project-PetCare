package com.pets.petcare.service;

import com.pets.petcare.dto.*;
import com.pets.petcare.entity.Order;
import com.pets.petcare.entity.OtpToken;
import com.pets.petcare.entity.Product;
import com.pets.petcare.entity.Vendor;
import com.pets.petcare.repository.OrderRepository;
import com.pets.petcare.repository.ProductRepository;
import com.pets.petcare.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorService {
    
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OtpService otpService;
    
    // OTP-BASED VENDOR REGISTRATION
    
    /**
     * STEP 1: Initiate vendor registration - send OTP to email
     */
    public ApiResponse<Void> initiateVendorRegistration(VendorRequest request) {
        try {
            // Check if email already exists
            if (vendorRepository.existsByEmail(request.getEmail())) {
                return ApiResponse.error("Email already registered");
            }
            
            // Generate and send OTP
            otpService.generateAndSendOtp(request.getEmail(), OtpToken.OtpType.REGISTRATION);
            
            log.info("OTP sent for vendor registration: {}", request.getEmail());
            return ApiResponse.success("OTP sent to your email. Please verify to complete registration.", null);
            
        } catch (Exception e) {
            log.error("Error initiating vendor registration for {}: {}", request.getEmail(), e.getMessage(), e);
            return ApiResponse.error("Failed to send OTP: " + e.getMessage());
        }
    }
    
    /**
     * STEP 2: Complete vendor registration - verify OTP and create account
     */
    @Transactional
    public VendorResponse completeVendorRegistration(VendorRequest request) {
        try {
            // Validate OTP field
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                throw new RuntimeException("OTP is required");
            }
            if (request.getOtp().length() != 6) {
                throw new RuntimeException("OTP must be 6 digits");
            }
            
            // Verify OTP
            if (!otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpToken.OtpType.REGISTRATION)) {
                throw new RuntimeException("Invalid or expired OTP");
            }
            
            // Check if email already exists (double-check)
            if (vendorRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
            }
            
            // Create vendor account
            Vendor vendor = new Vendor();
            vendor.setBusinessName(request.getBusinessName());
            vendor.setContactName(request.getContactName());
            vendor.setEmail(request.getEmail());
            // No password field - OTP-based authentication
            vendor.setPhone(request.getPhone());
            vendor.setAddress(request.getAddress());
            vendor.setCity(request.getCity());
            vendor.setState(request.getState());
            vendor.setZipCode(request.getZipCode());
            vendor.setBusinessLicense(request.getBusinessLicense());
            vendor.setTaxId(request.getTaxId());
            vendor.setStatus(Vendor.VendorStatus.APPROVED); // Auto-approve for better UX
            
            vendor = vendorRepository.save(vendor);
            log.info("New vendor registered with OTP: {}", vendor.getEmail());
            
            return VendorResponse.fromEntity(vendor);
            
        } catch (Exception e) {
            log.error("Error completing vendor registration for {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
    
    // OTP-BASED VENDOR LOGIN
    
    /**
     * STEP 1: Initiate vendor login - send OTP to email
     */
    public ApiResponse<Void> initiateVendorLogin(VendorLoginRequest request) {
        try {
            // Check if vendor exists
            Vendor vendor = vendorRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Vendor not found with this email"));
            
            // Check if vendor is approved
            if (vendor.getStatus() != Vendor.VendorStatus.APPROVED) {
                return ApiResponse.error("Vendor account is not approved yet. Please wait for admin approval.");
            }
            
            // Generate and send OTP
            otpService.generateAndSendOtp(request.getEmail(), OtpToken.OtpType.LOGIN);
            
            log.info("OTP sent for vendor login: {}", request.getEmail());
            return ApiResponse.success("OTP sent to your email. Please verify to complete login.", null);
            
        } catch (Exception e) {
            log.error("Error initiating vendor login for {}: {}", request.getEmail(), e.getMessage(), e);
            return ApiResponse.error("Failed to send OTP: " + e.getMessage());
        }
    }
    
    /**
     * STEP 2: Complete vendor login - verify OTP and authenticate
     */
    public VendorResponse completeVendorLogin(VendorLoginRequest request) {
        try {
            // Validate OTP field
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                throw new RuntimeException("OTP is required");
            }
            if (request.getOtp().length() != 6) {
                throw new RuntimeException("OTP must be 6 digits");
            }
            
            // Verify OTP
            if (!otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpToken.OtpType.LOGIN)) {
                throw new RuntimeException("Invalid or expired OTP");
            }
            
            // Get vendor
            Vendor vendor = vendorRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            
            // Check if vendor is approved
            if (vendor.getStatus() != Vendor.VendorStatus.APPROVED) {
                throw new RuntimeException("Vendor account is not approved yet");
            }
            
            log.info("Vendor login successful with OTP: {}", vendor.getEmail());
            return VendorResponse.fromEntity(vendor);
            
        } catch (Exception e) {
            log.error("Error completing vendor login for {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }
    
    // LEGACY PASSWORD-BASED METHODS (DEPRECATED)
    
    @Deprecated
    @Transactional
    public VendorResponse registerVendor(VendorRequest request) {
        // This method is deprecated - use OTP-based registration instead
        throw new RuntimeException("Password-based registration is deprecated. Please use OTP-based registration endpoints.");
    }
    
    @Deprecated
    public VendorResponse authenticateVendor(VendorLoginRequest request) {
        // This method is deprecated - use OTP-based login instead
        throw new RuntimeException("Password-based login is deprecated. Please use OTP-based login endpoints.");
    }
    
    public VendorResponse getVendorById(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return VendorResponse.fromEntity(vendor);
    }
    
    public VendorResponse getVendorByEmail(String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return VendorResponse.fromEntity(vendor);
    }
    
    @Transactional
    public VendorResponse updateVendorProfile(Long vendorId, VendorRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        // Update vendor profile fields
        vendor.setBusinessName(request.getBusinessName());
        vendor.setContactName(request.getContactName());
        vendor.setPhone(request.getPhone());
        vendor.setAddress(request.getAddress());
        vendor.setCity(request.getCity());
        vendor.setState(request.getState());
        vendor.setZipCode(request.getZipCode());
        vendor.setBusinessLicense(request.getBusinessLicense());
        vendor.setTaxId(request.getTaxId());
        
        // Note: Email cannot be changed as it's used for authentication
        
        vendor = vendorRepository.save(vendor);
        log.info("Vendor profile updated: {}", vendor.getEmail());
        
        return VendorResponse.fromEntity(vendor);
    }
    
    public Map<String, Object> getVendorDashboardStats(Long vendorId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Total products
        Long totalProducts = productRepository.countActiveByVendorId(vendorId);
        stats.put("totalProducts", totalProducts);
        
        // Orders statistics
        List<Object[]> orderStats = orderRepository.getVendorOrderStats(vendorId);
        Long pendingOrders = 0L;
        Long completedOrders = 0L;
        BigDecimal totalSales = BigDecimal.ZERO;
        
        for (Object[] stat : orderStats) {
            Order.OrderStatus status = (Order.OrderStatus) stat[0];
            Long count = (Long) stat[1];
            BigDecimal amount = (BigDecimal) stat[2];
            
            if (status == Order.OrderStatus.PENDING || status == Order.OrderStatus.CONFIRMED) {
                pendingOrders += count;
            } else if (status == Order.OrderStatus.DELIVERED) {
                completedOrders += count;
                totalSales = totalSales.add(amount);
            }
        }
        
        stats.put("pendingOrders", pendingOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("totalSales", totalSales);
        
        return stats;
    }
    
    public List<VendorOrderResponse> getVendorOrders(Long vendorId) {
        List<Object[]> orderData = orderRepository.getVendorOrders(vendorId);
        
        Map<Long, VendorOrderResponse> orderMap = new HashMap<>();
        
        for (Object[] data : orderData) {
            Long orderId = (Long) data[0];
            String orderNumber = (String) data[1];
            String customerName = (String) data[2];
            String customerEmail = (String) data[3];
            Order.OrderStatus orderStatus = (Order.OrderStatus) data[4];
            Order.PaymentStatus paymentStatus = (Order.PaymentStatus) data[5];
            BigDecimal totalAmount = (BigDecimal) data[6];
            
            VendorOrderResponse order = orderMap.computeIfAbsent(orderId, k -> {
                VendorOrderResponse response = new VendorOrderResponse();
                response.setOrderId(orderId);
                response.setOrderNumber(orderNumber);
                response.setCustomerName(customerName);
                response.setCustomerEmail(customerEmail);
                response.setOrderStatus(orderStatus);
                response.setPaymentStatus(paymentStatus);
                response.setTotalAmount(totalAmount);
                return response;
            });
            
            // Add order item
            VendorOrderResponse.VendorOrderItemResponse item = new VendorOrderResponse.VendorOrderItemResponse();
            item.setOrderItemId((Long) data[7]);
            item.setProductId((Long) data[8]);
            item.setProductName((String) data[9]);
            item.setQuantity((Integer) data[10]);
            item.setUnitPrice((BigDecimal) data[11]);
            item.setTotalPrice((BigDecimal) data[12]);
            
            if (order.getItems() == null) {
                order.setItems(List.of(item));
            } else {
                order.getItems().add(item);
            }
        }
        
        return orderMap.values().stream().collect(Collectors.toList());
    }
    
    public List<ProductResponse> getVendorProducts(Long vendorId) {
        List<Product> products = productRepository.findByVendorId(vendorId);
        return products.stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProductResponse createVendorProduct(Long vendorId, ProductRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        if (vendor.getStatus() != Vendor.VendorStatus.APPROVED) {
            throw new RuntimeException("Only approved vendors can create products");
        }
        
        Product product = new Product();
        product.setVendor(vendor);
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImages(request.getImages());
        // Ensure vendor products are always active by default
        product.setActive(request.getActive() != null ? request.getActive() : true);
        product.setDiscountPercentage(request.getDiscountPercentage());
        product.setBrand(request.getBrand());
        product.setSku(request.getSku());
        
        product = productRepository.save(product);
        log.info("Vendor {} created product: {} (Active: {})", vendor.getBusinessName(), product.getTitle(), product.getActive());
        
        return ProductResponse.fromEntity(product);
    }
    
    @Transactional
    public ProductResponse updateVendorProduct(Long vendorId, Long productId, ProductRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getVendor().getId().equals(vendorId)) {
            throw new RuntimeException("Product does not belong to this vendor");
        }
        
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImages(request.getImages());
        product.setActive(request.getActive());
        product.setDiscountPercentage(request.getDiscountPercentage());
        product.setBrand(request.getBrand());
        product.setSku(request.getSku());
        
        product = productRepository.save(product);
        log.info("Vendor {} updated product: {}", vendor.getBusinessName(), product.getTitle());
        
        return ProductResponse.fromEntity(product);
    }
    
    @Transactional
    public void deleteVendorProduct(Long vendorId, Long productId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getVendor().getId().equals(vendorId)) {
            throw new RuntimeException("Product does not belong to this vendor");
        }
        
        // Soft delete
        product.setActive(false);
        productRepository.save(product);
        
        log.info("Vendor {} deleted product: {}", vendor.getBusinessName(), product.getTitle());
    }
    
    @Transactional
    public VendorResponse updateVendorStatus(Long vendorId, Vendor.VendorStatus status) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        vendor.setStatus(status);
        vendor = vendorRepository.save(vendor);
        
        log.info("Vendor {} status updated to {}", vendor.getEmail(), status);
        return VendorResponse.fromEntity(vendor);
    }
    
    public Page<VendorResponse> getAllVendors(Pageable pageable) {
        return vendorRepository.findAll(pageable)
                .map(VendorResponse::fromEntity);
    }
    
    @Transactional
    public VendorOrderResponse updateOrderStatus(Long vendorId, Long orderId, String status) {
        log.info("VendorService: updateOrderStatus called with vendorId={}, orderId={}, status={}", vendorId, orderId, status);
        
        // Validate vendor exists
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> {
                    log.error("VendorService: Vendor not found with ID: {}", vendorId);
                    return new RuntimeException("Vendor not found");
                });
        
        log.info("VendorService: Vendor found: {}", vendor.getBusinessName());
        
        // Find the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("VendorService: Order not found with ID: {}", orderId);
                    return new RuntimeException("Order not found");
                });
        
        log.info("VendorService: Order found: {} with current status: {}", order.getOrderNumber(), order.getStatus());
        
        // Verify this order contains products from this vendor
        boolean hasVendorProducts = order.getItems().stream()
                .anyMatch(item -> {
                    boolean matches = item.getProduct().getVendor().getId().equals(vendorId);
                    log.info("VendorService: Order item {} belongs to vendor {}: {}", 
                        item.getProduct().getTitle(), vendorId, matches);
                    return matches;
                });
        
        if (!hasVendorProducts) {
            log.error("VendorService: Order {} does not contain products from vendor {}", orderId, vendorId);
            throw new RuntimeException("Order does not contain products from this vendor");
        }
        
        log.info("VendorService: Order contains vendor products, proceeding with status update");
        
        // Validate status transition
        Order.OrderStatus newStatus;
        try {
            newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            log.info("VendorService: Status validated: {}", newStatus);
        } catch (IllegalArgumentException e) {
            log.error("VendorService: Invalid order status: {}", status);
            throw new RuntimeException("Invalid order status: " + status);
        }
        
        // Update order status
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        
        // Set timestamps for specific statuses
        if (newStatus == Order.OrderStatus.SHIPPED && order.getShippedAt() == null) {
            order.setShippedAt(java.time.LocalDateTime.now());
            log.info("VendorService: Set shipped timestamp");
        } else if (newStatus == Order.OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(java.time.LocalDateTime.now());
            log.info("VendorService: Set delivered timestamp");
        }
        
        orderRepository.save(order);
        
        log.info("VendorService: Order {} status updated from {} to {} by vendor {}", 
            order.getOrderNumber(), oldStatus, newStatus, vendor.getBusinessName());
        
        // Return updated order details
        List<VendorOrderResponse> orders = getVendorOrders(vendorId);
        VendorOrderResponse updatedOrder = orders.stream()
                .filter(o -> o.getOrderId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("VendorService: Updated order not found in vendor orders list");
                    return new RuntimeException("Updated order not found");
                });
        
        log.info("VendorService: Returning updated order response");
        return updatedOrder;
    }
    
    public List<VendorResponse> getActiveVendors() {
        return vendorRepository.findActiveVendors().stream()
                .map(VendorResponse::fromEntity)
                .collect(Collectors.toList());
    }
}