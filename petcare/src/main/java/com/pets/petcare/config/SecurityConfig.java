package com.pets.petcare.config;

import com.pets.petcare.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * SecurityConfig - Main Spring Security configuration
 *
 * PURPOSE: Configure authentication, authorization, and security rules
 *
 * THIS CLASS CONTROLS:
 * 1. Which endpoints are public vs protected
 * 2. How authentication works (JWT)
 * 3. CORS settings (frontend-backend communication)
 * 4. Session management (stateless for JWT)
 */
@Configuration // Marks this as a configuration class
@EnableWebSecurity // Enables Spring Security
@EnableMethodSecurity // Allows @PreAuthorize on methods
public class SecurityConfig {

// Our custom JWT filter (validates tokens)
private final JwtAuthenticationFilter jwtAuthFilter;

public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
this.jwtAuthFilter = jwtAuthFilter;
}

/**
 * Main security configuration
 * This is where we define security rules
 */
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
http
// CSRF Protection: Disabled because we use JWT (not cookies)
// CSRF attacks target cookie-based authentication
// JWT in Authorization header is not vulnerable to CSRF
.csrf(csrf -> csrf.disable())

// CORS: Allow frontend (React) to call backend APIs
.cors(cors -> cors.configurationSource(corsConfigurationSource()))

// AUTHORIZATION RULES
.authorizeHttpRequests(auth -> auth
// PUBLIC ENDPOINTS - No authentication required
.requestMatchers("/api/auth/**").permitAll() // Login, Register
.requestMatchers("/api/health").permitAll() // Health check

// PROTECTED ENDPOINTS - Authentication required
.anyRequest().authenticated() // Everything else
)

// SESSION MANAGEMENT
// STATELESS: Server doesn't store session data
// Each request must include JWT token
.sessionManagement(session -> session
.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

// ADD JWT FILTER
// Our JwtAuthenticationFilter runs BEFORE Spring's default filter
// Order matters: JWT validation happens first
.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

return http.build();
}

/**
 * CORS Configuration
 *
 * WHAT IS CORS?
 * Cross-Origin Resource Sharing
 * Browsers block requests from different domains by default
 *
 * Example:
 * - Frontend: http://localhost:3000 (React)
 * - Backend: http://localhost:8080 (Spring Boot)
 * Without CORS config, browser blocks these requests
 */
@Bean
public CorsConfigurationSource corsConfigurationSource() {
CorsConfiguration configuration = new CorsConfiguration();

// ALLOWED ORIGINS: Which frontend URLs can access backend?
configuration.setAllowedOrigins(Arrays.asList(
"http://localhost:3000", // React default port
"http://localhost:3001", // Additional React frontend port
"http://localhost:5173"  // Vite default port
));

// ALLOWED METHODS: Which HTTP methods are allowed?
configuration.setAllowedMethods(Arrays.asList(
"GET",     // Read data
"POST",    // Create data
"PUT",     // Update data
"DELETE",  // Delete data
"PATCH",   // Partial update
"OPTIONS"  // Pre-flight requests
));

// ALLOWED HEADERS: Which headers can frontend send?
configuration.setAllowedHeaders(Arrays.asList("*")); // All headers

// ALLOW CREDENTIALS: Can frontend send cookies/auth headers?
configuration.setAllowCredentials(true); // Yes (needed for JWT)

// Apply CORS settings to all endpoints
UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
source.registerCorsConfiguration("/**", configuration);

return source;
}

}
