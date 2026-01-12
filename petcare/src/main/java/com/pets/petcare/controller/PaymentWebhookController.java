package com.pets.petcare.controller;

import com.pets.petcare.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/paypal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentWebhookController {
    
    private final PaymentService paymentService;
    
    @Value("${paypal.webhook.id}")
    private String webhookId;
    
    @PostMapping("/payment")
    public ResponseEntity<String> handlePaymentWebhook(
            HttpServletRequest request,
            @RequestBody Map<String, Object> payload) {
        
        try {
            log.info("Received PayPal webhook: {}", payload);
            
            String eventType = (String) payload.get("event_type");
            @SuppressWarnings("unchecked")
            Map<String, Object> resource = (Map<String, Object>) payload.get("resource");
            
            if (resource == null) {
                log.warn("No resource found in PayPal webhook payload");
                return ResponseEntity.badRequest().body("Invalid payload");
            }
            
            String paymentId = (String) resource.get("id");
            String state = (String) resource.get("state");
            
            log.info("Processing PayPal webhook event: {} for payment: {}", eventType, paymentId);
            
            switch (eventType) {
                case "PAYMENT.SALE.COMPLETED":
                    handlePaymentCompleted(paymentId, resource);
                    break;
                case "PAYMENT.SALE.DENIED":
                case "PAYMENT.SALE.REFUNDED":
                    handlePaymentFailed(paymentId, resource);
                    break;
                default:
                    log.info("Unhandled PayPal webhook event: {}", eventType);
            }
            
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            log.error("Error processing PayPal webhook: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }
    
    private void handlePaymentCompleted(String paymentId, Map<String, Object> resource) {
        try {
            log.info("Payment completed for PayPal payment: {}", paymentId);
            
            // Additional processing can be done here if needed
            // The payment verification should have already been done by the frontend
            
            log.info("Payment completion webhook processed successfully for payment: {}", paymentId);
            
        } catch (Exception e) {
            log.error("Error handling payment completed webhook: {}", e.getMessage(), e);
        }
    }
    
    private void handlePaymentFailed(String paymentId, Map<String, Object> resource) {
        try {
            String failureReason = "PayPal payment failed or was refunded";
            
            log.info("Payment failed for PayPal payment: {}, reason: {}", paymentId, failureReason);
            
            paymentService.handlePaymentFailure(paymentId, failureReason);
            
            log.info("Payment failure webhook processed successfully for payment: {}", paymentId);
            
        } catch (Exception e) {
            log.error("Error handling payment failed webhook: {}", e.getMessage(), e);
        }
    }
}