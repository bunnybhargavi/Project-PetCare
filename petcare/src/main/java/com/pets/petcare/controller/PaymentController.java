package com.pets.petcare.controller;

import com.pets.petcare.dto.ApiResponse;
import com.pets.petcare.dto.PaymentRequest;
import com.pets.petcare.dto.PaymentResponse;
import com.pets.petcare.dto.PaymentVerificationRequest;
import com.pets.petcare.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPaymentOrder(@Valid @RequestBody PaymentRequest request) {
        try {
            log.info("Creating payment order for order ID: {}", request.getOrderId());
            PaymentResponse response = paymentService.createPaymentOrder(request);
            return ResponseEntity.ok(ApiResponse.success("Payment order created successfully", response));
        } catch (Exception e) {
            log.error("Error creating payment order: {}", e.getMessage(), e);
            e.printStackTrace(); // Log trace to terminal
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create payment order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        try {
            log.info("Verifying payment for PayPal payment ID: {}", request.getPaypalPaymentId());
            PaymentResponse response = paymentService.verifyPayment(request);
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
        } catch (Exception e) {
            log.error("Error verifying payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Payment verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/failure")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> handlePaymentFailure(@RequestBody Map<String, String> request) {
        try {
            String paypalPaymentId = request.get("paypalPaymentId");
            String failureReason = request.get("failureReason");

            log.info("Handling payment failure for PayPal payment ID: {}", paypalPaymentId);
            paymentService.handlePaymentFailure(paypalPaymentId, failureReason);
            return ResponseEntity.ok(ApiResponse.success("Payment failure handled successfully"));
        } catch (Exception e) {
            log.error("Error handling payment failure: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to handle payment failure: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getUserPayments(@PathVariable Long userId) {
        try {
            List<PaymentResponse> payments = paymentService.getPaymentsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("User payments retrieved successfully", payments));
        } catch (Exception e) {
            log.error("Error retrieving user payments: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve user payments: " + e.getMessage()));
        }
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getOrderPayment(@PathVariable Long orderId) {
        try {
            return paymentService.getPaymentByOrderId(orderId)
                    .map(payment -> ResponseEntity
                            .ok(ApiResponse.success("Order payment retrieved successfully", payment)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving order payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve order payment: " + e.getMessage()));
        }
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable Long paymentId) {
        try {
            PaymentResponse payment = paymentService.getPaymentById(paymentId);
            return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
        } catch (Exception e) {
            log.error("Error retrieving payment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve payment: " + e.getMessage()));
        }
    }
}