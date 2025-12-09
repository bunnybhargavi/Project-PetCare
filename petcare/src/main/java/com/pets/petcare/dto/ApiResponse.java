package com.pets.petcare.dto;

/**
 * ApiResponse - Generic response for simple API calls
 * Used for operations that don't return complex data
 */
public class ApiResponse {
    private boolean success; // Was operation successful?
    private String message; // Status message

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
