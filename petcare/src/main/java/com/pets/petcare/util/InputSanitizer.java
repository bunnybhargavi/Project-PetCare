package com.pets.petcare.util;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class InputSanitizer {
    
    // Patterns for validation
    private static final Pattern HTML_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script[^>]*>.*?</script>");
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile("(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)");
    private static final Pattern XSS_PATTERN = Pattern.compile("(?i)(javascript:|vbscript:|onload|onerror|onclick)");
    
    /**
     * Sanitize text input by removing potentially dangerous content
     */
    public String sanitizeText(String input) {
        if (input == null) return null;
        
        // Remove script tags
        String sanitized = SCRIPT_PATTERN.matcher(input).replaceAll("");
        
        // Remove HTML tags (basic sanitization)
        sanitized = HTML_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove potential XSS patterns
        sanitized = XSS_PATTERN.matcher(sanitized).replaceAll("");
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        return sanitized;
    }
    
    /**
     * Validate that input doesn't contain SQL injection patterns
     */
    public boolean containsSqlInjection(String input) {
        if (input == null) return false;
        return SQL_INJECTION_PATTERN.matcher(input).find();
    }
    
    /**
     * Validate email format
     */
    public boolean isValidEmail(String email) {
        if (email == null) return false;
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
    
    /**
     * Validate phone number (10 digits)
     */
    public boolean isValidPhone(String phone) {
        if (phone == null) return false;
        return phone.matches("^[0-9]{10}$");
    }
    
    /**
     * Validate ZIP code (5-6 digits)
     */
    public boolean isValidZipCode(String zipCode) {
        if (zipCode == null) return false;
        return zipCode.matches("^[0-9]{5,6}$");
    }
    
    /**
     * Validate that string contains only alphanumeric characters and spaces
     */
    public boolean isAlphanumericWithSpaces(String input) {
        if (input == null) return false;
        return input.matches("^[a-zA-Z0-9\\s]+$");
    }
    
    /**
     * Validate that string contains only letters and spaces
     */
    public boolean isAlphabeticWithSpaces(String input) {
        if (input == null) return false;
        return input.matches("^[a-zA-Z\\s]+$");
    }
    
    /**
     * Sanitize and validate text input
     */
    public String sanitizeAndValidate(String input, int maxLength) {
        if (input == null) return null;
        
        // Check for SQL injection
        if (containsSqlInjection(input)) {
            throw new IllegalArgumentException("Invalid input detected");
        }
        
        // Sanitize
        String sanitized = sanitizeText(input);
        
        // Check length
        if (sanitized.length() > maxLength) {
            throw new IllegalArgumentException("Input exceeds maximum length of " + maxLength);
        }
        
        return sanitized;
    }
}