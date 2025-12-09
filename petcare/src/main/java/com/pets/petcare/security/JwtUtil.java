package com.pets.petcare.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtUtil - Utility class for JWT (JSON Web Token) operations
 *
 * PURPOSE: Generate and validate JWT tokens for authentication
 *
 * WHAT IS JWT?
 * JWT is a token that contains user information in encrypted format
 * Structure: header.payload.signature
 * Example: eyJhbGc.eyJzdWIi.SflKxwRJ
 *
 * WHY JWT?
 * - Stateless authentication (no session storage needed)
 * - Contains user info (no database lookup on every request)
 * - Secure (cryptographically signed)
 * - Portable (works across different services)
 */
@Component
public class JwtUtil {

    // Read secret key from application.properties
    @Value("${jwt.secret}")
    private String secret;

    // Token expiration time (in milliseconds)
    // Default: 86400000 ms = 24 hours
    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Create signing key from secret string
     * This key is used to sign and verify tokens
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate JWT token for a user
     *
     * @param email - User's email (token subject)
     * @param role - User's role (OWNER/VET)
     * @param userId - User's database ID
     * @return JWT token string
     *
     * TOKEN STRUCTURE:
     * {
     *   "sub": "john@example.com",        // Subject (email)
     *   "role": "OWNER",                  // Custom claim
     *   "userId": 123,                    // Custom claim
     *   "iat": 1234567890,                // Issued at
     *   "exp": 1234654290                 // Expires at
     * }
     */
    public String generateToken(String email, String role, Long userId) {
        // Custom claims (additional data in token)
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userId", userId);

        return Jwts.builder()
                .setClaims(claims)              // Add custom data
                .setSubject(email)              // Set email as subject
                .setIssuedAt(new Date())        // Token creation time
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)  // Sign token
                .compact();                     // Build final token string
    }

    /**
     * Extract email from token
     * Used to identify which user the token belongs to
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extract role from token
     * Used for role-based access control
     */
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /**
     * Extract user ID from token
     * Useful for database operations
     */
    public Long extractUserId(String token) {
        return extractAllClaims(token).get("userId", Long.class);
    }

    /**
     * Validate if token is valid for given email
     * Checks: email matches AND token not expired
     *
     * @param token - JWT token to validate
     * @param email - Expected email
     * @return true if valid, false otherwise
     */
    public boolean isTokenValid(String token, String email) {
        final String tokenEmail = extractEmail(token);
        return (tokenEmail.equals(email) && !isTokenExpired(token));
    }

    /**
     * Check if token has expired
     */
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * Extract all claims (data) from token
     * This is the core method that parses and verifies the token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())  // Use same key to verify
                .build()
                .parseClaimsJws(token)           // Parse and verify
                .getBody();                      // Get claims
    }
}
