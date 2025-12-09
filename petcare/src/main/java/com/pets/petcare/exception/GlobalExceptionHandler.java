package com.pets.petcare.exception;

import com.pets.petcare.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler - Centralized exception handling
 *
 * PURPOSE: Catch exceptions from all controllers and return proper error responses
 *
 * WHY NEEDED?
 * Without this, exceptions would return generic error messages
 * With this, we control exact error format sent to frontend
 *
 * @RestControllerAdvice - Applies to all @RestController classes
 * Catches exceptions globally across the application
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle RuntimeException (most common exceptions we throw)
     *
     * CATCHES:
     * - throw new RuntimeException("User not found")
     * - throw new RuntimeException("Invalid OTP")
     * - throw new RuntimeException("Email already registered")
     *
     * @ExceptionHandler(RuntimeException.class)
     * - This method handles all RuntimeException instances
     * - When any controller throws RuntimeException, this catches it
     *
     * EXAMPLE:
     * Service throws: throw new RuntimeException("User not found")
     * This handler catches it
     * Returns: { "success": false, "message": "User not found" }
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)  // 400 status code
                .body(new ApiResponse(false, ex.getMessage()));
    }

    /**
     * Handle validation errors from @Valid annotation
     *
     * CATCHES: Validation failures on DTOs
     *
     * EXAMPLE 1: Missing required field
     * Request: { "email": "" }  // Email is blank
     * DTO: @NotBlank(message = "Email is required")
     *
     * This handler catches validation error
     * Returns: { "email": "Email is required" }
     * HTTP Status: 400 Bad Request
     *
     * EXAMPLE 2: Invalid format
     * Request: { "email": "not-an-email" }
     * DTO: @Email(message = "Invalid email format")
     *
     * Returns: { "email": "Invalid email format" }
     *
     * EXAMPLE 3: Multiple errors
     * Request: { "email": "", "phone": "123" }
     * Returns: {
     *   "email": "Email is required",
     *   "phone": "Phone must be 10 digits"
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();

        // Loop through all validation errors
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)  // 400 status code
                .body(errors);
    }

    /**
     * Handle any other unexpected exceptions
     *
     * CATCHES: All exceptions not caught by specific handlers
     *
     * EXAMPLES:
     * - NullPointerException
     * - SQLException
     * - IOException
     * - Any other unexpected error
     *
     * PURPOSE: Prevent exposing internal error details to frontend
     * Instead of stack trace, return user-friendly message
     *
     * Returns: Generic error message
     * HTTP Status: 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGenericException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)  // 500 status code
                .body(new ApiResponse(false, "An error occurred: " + ex.getMessage()));
    }
}
