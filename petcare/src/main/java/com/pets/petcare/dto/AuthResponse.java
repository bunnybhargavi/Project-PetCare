package com.pets.petcare.dto;

/**
 * AuthResponse - Sent to frontend after successful login/registration
 * Contains JWT token and user information
 */
public class AuthResponse {
    private String token; // JWT token for authentication
    private Long userId; // User's database ID
    private String email; // User's email
    private String name; // User's name
    private String role; // OWNER or VET
    private Long vetId; // Veterinarian specific ID (null if not a vet)
    private String message; // Success/error message

    // Constructors
    public AuthResponse() {
    }

    public AuthResponse(String token, Long userId, String email, String name, String role, Long vetId, String message) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.vetId = vetId;
        this.message = message;
    }

    // Builder pattern support
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private Long userId;
        private String email;
        private String name;
        private String role;
        private Long vetId;
        private String message;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder vetId(Long vetId) {
            this.vetId = vetId;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(token, userId, email, name, role, vetId, message);
        }
    }

    // Getters
    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public Long getVetId() {
        return vetId;
    }

    public String getMessage() {
        return message;
    }

    // Setters
    public void setToken(String token) {
        this.token = token;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setVetId(Long vetId) {
        this.vetId = vetId;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
