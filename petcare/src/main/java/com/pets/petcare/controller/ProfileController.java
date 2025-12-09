package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.UserService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * ProfileController - REST API endpoints for user profile management
 *
 * PURPOSE: Handle profile viewing, updating, and photo uploads
 *
 * BASE URL: /api/profile
 * All endpoints here are PROTECTED (authentication required)
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get current user's profile
     *
     * URL: GET /api/profile
     * Authentication: Required (JWT token)
     *
     * REQUEST HEADERS:
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *
     * RESPONSE: 200 OK
     * {
     * "id": 1,
     * "email": "john@example.com",
     * "name": "John Doe",
     * "phone": "9876543210",
     * "address": "123 Main St",
     * "profilePhoto": "/uploads/profiles/a1b2c3.jpg",
     * "role": "OWNER",
     * "isActive": true
     * }
     *
     * @param authentication - Provided by Spring Security
     *                       Contains user info extracted from JWT token
     *                       authentication.getName() returns email
     */
    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        // Extract email from JWT token (set by JwtAuthenticationFilter)
        String email = authentication.getName();

        // Get profile from service
        UserProfileResponse profile = userService.getUserProfile(email);

        return ResponseEntity.ok(profile);
    }

    /**
     * Update current user's profile
     *
     * URL: PUT /api/profile
     * Authentication: Required
     *
     * REQUEST HEADERS:
     * Authorization: Bearer eyJhbGc...
     * Content-Type: application/json
     *
     * REQUEST BODY:
     * {
     * "name": "John Smith",
     * "phone": "9876543210",
     * "address": "456 Oak Avenue"
     * }
     *
     * For VET users, can also include:
     * {
     * "name": "Dr. Sarah Smith",
     * "phone": "9876543210",
     * "clinicName": "Happy Pets Clinic",
     * "specialization": "Small Animals",
     * "clinicAddress": "789 Pet Street"
     * }
     *
     * RESPONSE: 200 OK
     * (Updated profile data)
     */
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        UserProfileResponse profile = userService.updateProfile(email, request);
        return ResponseEntity.ok(profile);
    }

    /**
     * Upload profile photo
     *
     * URL: POST /api/profile/photo
     * Authentication: Required
     *
     * REQUEST HEADERS:
     * Authorization: Bearer eyJhbGc...
     * Content-Type: multipart/form-data
     *
     * REQUEST BODY: (form data)
     * file: [image file]
     *
     * RESPONSE: 200 OK
     * {
     * "success": true,
     * "message": "Photo uploaded successfully: /uploads/profiles/uuid.jpg"
     * }
     *
     * @param file - Image file uploaded from frontend
     *             Spring automatically converts multipart data to MultipartFile
     */
    @PostMapping("/photo")
    public ResponseEntity<ApiResponse> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String email = authentication.getName();
        String photoUrl = userService.uploadProfilePhoto(email, file);
        return ResponseEntity.ok(
                new ApiResponse(true, "Photo uploaded successfully: " + photoUrl));
    }

    /**
     * Get any user's profile by ID
     *
     * URL: GET /api/profile/{userId}
     * Authentication: Required
     *
     * PURPOSE: View other users' profiles (e.g., vet profiles when booking)
     *
     * EXAMPLE:
     * GET /api/profile/5
     *
     * RESPONSE: 200 OK
     * {
     * "id": 5,
     * "name": "Dr. Sarah Smith",
     * "email": "sarah@vet.com",
     * "role": "VET",
     * "clinicName": "Happy Pets Clinic",
     * "specialization": "Small Animals",
     * "clinicAddress": "789 Pet Street"
     * }
     *
     * @PathVariable - Extracts {userId} from URL path
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long userId) {
        UserProfileResponse profile = userService.getUserProfileById(userId);
        return ResponseEntity.ok(profile);
    }
}
