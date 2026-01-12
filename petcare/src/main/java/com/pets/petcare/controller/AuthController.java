package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - REST API endpoints for authentication
 *
 * PURPOSE: Handle HTTP requests for registration and login
 *
 * BASE URL: /api/auth
 * All endpoints here are PUBLIC (no authentication required)
 */
@RestController // Marks this as a REST controller
@RequestMapping("/api/auth") // Base URL for all endpoints in this controller
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Health check endpoint
     *
     * URL: GET /api/auth/health
     * Purpose: Verify API is running
     *
     * TEST IN BROWSER:
     * http://localhost:8080/api/auth/health
     *
     * RESPONSE: "Pet Care API is running!"
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Pet Care API is running!");
    }

    /**
     * REGISTRATION STEP 1: Initiate registration and send OTP
     *
     * URL: POST /api/auth/register/initiate
     *
     * REQUEST BODY:
     * {
     * "email": "john@example.com",
     * "name": "John Doe",
     * "phone": "9876543210",
     * "role": "OWNER"
     * }
     *
     * RESPONSE:
     * {
     * "success": true,
     * "message": "OTP sent to your email. Please verify to complete registration."
     * }
     *
     * @Valid - Validates request body against DTO constraints
     * @RequestBody - Extracts JSON from request body
     */
    @PostMapping("/register/initiate")
    public ResponseEntity<ApiResponse> initiateRegistration(
            @Valid @RequestBody RegisterRequest request) {
        // System.out.println(">>> [AuthController] Received registration request for: "
        // + request.getEmail());
        // Using System.out might be missed in file logs, using a logger if available or
        // just System.err might be better,
        // but strictly speaking I should use the logger class field usually present in
        // controllers or create one.
        // The class doesn't have a logger field. I will add one? OR just use System.err
        // which usually captures into logs?
        // Let's rely on the fact that I want to see if it even hits.
        // Actually, let's just add a logger since I can't be sure about stdout
        // redirection.
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);
        logger.info(">>> [AuthController] Received registration request for: " + request.getEmail());
        ApiResponse response = authService.initiateRegistration(request);
        return ResponseEntity.ok(response);
    }

    /**
     * REGISTRATION STEP 2: Verify OTP and create account
     *
     * URL: POST /api/auth/register/complete
     *
     * REQUEST BODY:
     * {
     * "email": "john@example.com",
     * "otp": "123456",
     * "name": "John Doe",
     * "phone": "9876543210",
     * "role": "OWNER"
     * }
     *
     * RESPONSE:
     * {
     * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     * "userId": 1,
     * "email": "john@example.com",
     * "name": "John Doe",
     * "role": "OWNER",
     * "message": "Registration successful"
     * }
     *
     * NOTE: This endpoint combines both OTP verification and registration data
     * Frontend sends all required fields in a single request body
     */
    @PostMapping("/register/complete")
    public ResponseEntity<AuthResponse> completeRegistration(
            @Valid @RequestBody RegisterRequest request) {
        // Convert RegisterRequest to OtpVerificationRequest for service layer
        OtpVerificationRequest otpRequest = new OtpVerificationRequest(request.getEmail(), request.getOtp());
        AuthResponse response = authService.completeRegistration(otpRequest, request);
        return ResponseEntity.ok(response);
    }

    /**
     * LOGIN STEP 1: Send OTP to email
     *
     * URL: POST /api/auth/login/initiate
     *
     * REQUEST BODY:
     * {
     * "email": "john@example.com"
     * }
     *
     * RESPONSE:
     * {
     * "success": true,
     * "message": "OTP sent to your email"
     * }
     */
    @PostMapping("/login/initiate")
    public ResponseEntity<ApiResponse> initiateLogin(
            @Valid @RequestBody LoginRequest request) {
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);
        logger.info(">>> [AuthController] Received LOGIN OTP request for: " + request.getEmail());
        ApiResponse response = authService.initiateLogin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * LOGIN STEP 2: Verify OTP and login
     *
     * URL: POST /api/auth/login/complete
     *
     * REQUEST BODY:
     * {
     * "email": "john@example.com",
     * "otp": "123456"
     * }
     *
     * RESPONSE:
     * {
     * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     * "userId": 1,
     * "email": "john@example.com",
     * "name": "John Doe",
     * "role": "OWNER",
     * "message": "Login successful"
     * }
     */
    @PostMapping("/login/complete")
    public ResponseEntity<AuthResponse> completeLogin(
            @Valid @RequestBody OtpVerificationRequest request) {
        AuthResponse response = authService.completeLogin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Logout endpoint
     *
     * URL: POST /api/auth/logout
     *
     * NOTE: Since JWT is stateless, logout is handled on frontend
     * Frontend simply removes token from localStorage
     * This endpoint is optional, just for consistency
     *
     * RESPONSE:
     * {
     * "success": true,
     * "message": "Logged out successfully"
     * }
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        // JWT is stateless, actual logout happens on client side
        // This endpoint can be used for audit logs if needed
        return ResponseEntity.ok(new ApiResponse(true, "Logged out successfully"));
    }
}