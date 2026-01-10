package com.pets.petcare.service;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import com.pets.petcare.dto.PaymentRequest;
import com.pets.petcare.dto.PaymentResponse;
import com.pets.petcare.dto.PaymentVerificationRequest;
import com.pets.petcare.entity.Order;
import com.pets.petcare.entity.Payment;
import com.pets.petcare.repository.OrderRepository;
import com.pets.petcare.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final APIContext apiContext;
    private final EmailService emailService;

    @Value("${paypal.client.id}")
    private String paypalClientId;

    @Value("${paypal.client.secret}")
    private String paypalClientSecret;

    @Value("${paypal.mode}")
    private String paypalMode;

    private boolean isPayPalConfigured() {
        return paypalClientId != null && !paypalClientId.isEmpty() &&
                !paypalClientId.contains("your_client_id_here") &&
                paypalClientSecret != null && !paypalClientSecret.isEmpty() &&
                !paypalClientSecret.contains("your_client_secret_here");
    }

    @Transactional
    public PaymentResponse createPaymentOrder(PaymentRequest request) {
        try {
            // Validate order exists
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));

            // Use mock service if PayPal is not configured or if payment method is TEST_PAYMENT
            if (!isPayPalConfigured() || order.getPaymentMethod() == Order.PaymentMethod.TEST_PAYMENT) {
                log.info("Using mock payment service. PayPal Configured: {}, Method: {}", isPayPalConfigured(),
                        order.getPaymentMethod());
                return createMockPaymentOrder(request, order);
            }

            // Check if payment already exists for this order
            Optional<Payment> existingPayment = paymentRepository.findByOrderIdAndStatus(
                    request.getOrderId(), Payment.PaymentStatus.INITIATED);

            if (existingPayment.isPresent()) {
                log.info("Payment already exists for order: {}", request.getOrderId());
                PaymentResponse response = PaymentResponse.fromEntity(existingPayment.get());
                response.setPaypalClientId(paypalClientId);
                return response;
            }

            // Create PayPal payment
            com.paypal.api.payments.Payment paypalPayment = createPayPalPayment(request, order);

            log.info("Created PayPal payment: {}", paypalPayment.getId());

            // Create payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .paypalPaymentId(paypalPayment.getId())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .status(Payment.PaymentStatus.INITIATED)
                    .build();

            payment = paymentRepository.save(payment);

            // Update order with PayPal payment ID
            order.setPaypalPaymentId(paypalPayment.getId());
            orderRepository.save(order);

            PaymentResponse response = PaymentResponse.fromEntity(payment);
            response.setPaypalClientId(paypalClientId);

            // Get approval URL
            for (Links link : paypalPayment.getLinks()) {
                if (link.getRel().equals("approval_url")) {
                    response.setApprovalUrl(link.getHref());
                    break;
                }
            }

            log.info("Payment order created successfully for order: {}", request.getOrderId());
            return response;

        } catch (PayPalRESTException e) {
            log.error("Error creating PayPal payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating payment order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
    }

    private PaymentResponse createMockPaymentOrder(PaymentRequest request, Order order) {
        log.info("Creating mock payment order for order: {}", request.getOrderId());
        
        // Create mock payment record
        Payment payment = Payment.builder()
                .order(order)
                .paypalPaymentId("MOCK_" + UUID.randomUUID().toString())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .status(Payment.PaymentStatus.INITIATED)
                .build();

        payment = paymentRepository.save(payment);

        PaymentResponse response = PaymentResponse.fromEntity(payment);
        response.setPaypalClientId("mock_client_id");
        response.setApprovalUrl("http://localhost:3000/payment/success?paymentId=" + payment.getPaypalPaymentId() + "&PayerID=mock_payer");

        log.info("Mock payment order created successfully for order: {}", request.getOrderId());
        return response;
    }

    private com.paypal.api.payments.Payment createPayPalPayment(PaymentRequest request, Order order)
            throws PayPalRESTException {
        Amount amount = new Amount();
        amount.setCurrency(request.getCurrency());
        amount.setTotal(request.getAmount().toString());

        Transaction transaction = new Transaction();
        transaction.setDescription("Pet Paradise Order #" + order.getOrderNumber());
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        com.paypal.api.payments.Payment payment = new com.paypal.api.payments.Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl("http://localhost:3000/payment/cancel");
        redirectUrls.setReturnUrl("http://localhost:3000/payment/success");
        payment.setRedirectUrls(redirectUrls);

        return payment.create(apiContext);
    }

    @Transactional
    public PaymentResponse verifyPayment(PaymentVerificationRequest request) {
        // Use mock service if PayPal is not configured
        if (!isPayPalConfigured()) {
            log.warn("PayPal not configured, using mock payment verification");
            return verifyMockPayment(request);
        }

        try {
            // Find payment by PayPal payment ID
            Payment payment = paymentRepository.findByPaypalPaymentId(request.getPaypalPaymentId())
                    .orElseThrow(() -> new RuntimeException(
                            "Payment not found for PayPal payment ID: " + request.getPaypalPaymentId()));

            // Execute PayPal payment
            com.paypal.api.payments.Payment paypalPayment = com.paypal.api.payments.Payment.get(apiContext,
                    request.getPaypalPaymentId());

            PaymentExecution paymentExecute = new PaymentExecution();
            paymentExecute.setPayerId(request.getPayerId());

            com.paypal.api.payments.Payment executedPayment = paypalPayment.execute(apiContext, paymentExecute);

            if (executedPayment.getState().equals("approved")) {
                // Update payment status
                payment.setPaypalPayerId(request.getPayerId());
                payment.setStatus(Payment.PaymentStatus.SUCCESS);

                // Update order payment status
                Order order = payment.getOrder();
                order.setPaymentStatus(Order.PaymentStatus.PAID);
                order.setPaymentTransactionId(executedPayment.getId());

                // Update order status to CONFIRMED if it's still PENDING
                if (order.getStatus() == Order.OrderStatus.PENDING) {
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                }

                orderRepository.save(order);
                payment = paymentRepository.save(payment);

                // Send confirmation email
                try {
                    String userEmail = order.getUser().getEmail();
                    String userName = order.getUser().getName();
                    emailService.sendOrderConfirmationEmail(userEmail, userName,
                            order.getId().toString(),
                            "₹" + order.getTotalAmount(),
                            new java.util.Date().toString());
                } catch (Exception e) {
                    log.error("Failed to trigger confirmation email", e);
                }

                log.info("Payment verified successfully for order: {}", order.getId());
                return PaymentResponse.fromEntity(payment);

            } else {
                // Payment not approved
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("Payment not approved by PayPal");

                Order order = payment.getOrder();
                order.setPaymentStatus(Order.PaymentStatus.FAILED);

                orderRepository.save(order);
                paymentRepository.save(payment);

                log.warn("Payment verification failed for order: {} - Not approved", payment.getOrder().getId());
                throw new RuntimeException("Payment verification failed: Payment not approved");
            }

        } catch (PayPalRESTException e) {
            log.error("Error verifying PayPal payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to verify payment: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error verifying payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to verify payment: " + e.getMessage());
        }
    }

    private PaymentResponse verifyMockPayment(PaymentVerificationRequest request) {
        log.info("Verifying mock payment: {}", request.getPaypalPaymentId());
        
        // Find payment by PayPal payment ID
        Payment payment = paymentRepository.findByPaypalPaymentId(request.getPaypalPaymentId())
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found for PayPal payment ID: " + request.getPaypalPaymentId()));

        // Update payment status
        payment.setPaypalPayerId(request.getPayerId());
        payment.setStatus(Payment.PaymentStatus.SUCCESS);

        // Update order payment status
        Order order = payment.getOrder();
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setPaymentTransactionId("MOCK_TXN_" + UUID.randomUUID().toString());

        // Update order status to CONFIRMED if it's still PENDING
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
        }

        orderRepository.save(order);
        payment = paymentRepository.save(payment);

        // Send confirmation email
        try {
            String userEmail = order.getUser().getEmail();
            String userName = order.getUser().getName();
            emailService.sendOrderConfirmationEmail(userEmail, userName,
                    order.getId().toString(),
                    "₹" + order.getTotalAmount(),
                    new java.util.Date().toString());
        } catch (Exception e) {
            log.error("Failed to trigger confirmation email", e);
        }

        log.info("Mock payment verified successfully for order: {}", order.getId());
        return PaymentResponse.fromEntity(payment);
    }

    @Transactional
    public void handlePaymentFailure(String paypalPaymentId, String failureReason) {
        try {
            Payment payment = paymentRepository.findByPaypalPaymentId(paypalPaymentId)
                    .orElseThrow(
                            () -> new RuntimeException("Payment not found for PayPal payment ID: " + paypalPaymentId));

            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason(failureReason);

            Order order = payment.getOrder();
            order.setPaymentStatus(Order.PaymentStatus.FAILED);

            orderRepository.save(order);
            paymentRepository.save(payment);

            log.info("Payment failure handled for order: {}", order.getId());

        } catch (Exception e) {
            log.error("Error handling payment failure: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to handle payment failure: " + e.getMessage());
        }
    }

    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);
        return payments.stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<PaymentResponse> getPaymentByOrderId(Long orderId) {
        List<Payment> payments = paymentRepository.findByOrderId(orderId);
        return payments.stream()
                .findFirst()
                .map(PaymentResponse::fromEntity);
    }

    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
        return PaymentResponse.fromEntity(payment);
    }
}