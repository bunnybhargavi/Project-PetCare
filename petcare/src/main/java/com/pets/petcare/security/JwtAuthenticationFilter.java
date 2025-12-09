package com.pets.petcare.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

/**
 * JwtAuthenticationFilter - Intercepts every HTTP request
 *
 * PURPOSE: Extract and validate JWT token before processing request
 *
 * WHAT IS A FILTER?
 * A filter runs before the request reaches the controller
 * It can:
 * - Inspect the request
 * - Modify the request/response
 * - Block the request if unauthorized
 * - Pass the request to next filter/controller
 *
 * REQUEST FLOW:
 * Client → Filter1 → Filter2 → Filter3 → Controller → Response
 * ↑_____ This is where we validate JWT _____↑
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * This method runs for EVERY incoming HTTP request
     *
     * @param request     - The HTTP request
     * @param response    - The HTTP response
     * @param filterChain - Chain of filters to execute
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // STEP 1: Extract Authorization header
        // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        final String authHeader = request.getHeader("Authorization");

        // STEP 2: Check if header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token found - proceed without authentication
            // Public endpoints will still work
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // STEP 3: Extract JWT token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);

            // STEP 4: Extract user information from token
            final String userEmail = jwtUtil.extractEmail(jwt);
            final String role = jwtUtil.extractRole(jwt);

            // STEP 5: Check if user is not already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // STEP 6: Validate token
                if (jwtUtil.isTokenValid(jwt, userEmail)) {

                    // STEP 7: Create authentication object
                    // This tells Spring Security: "This user is authenticated"
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail, // Principal (who is the user?)
                            null, // Credentials (we don't need password)
                            Collections.singletonList(
                                    new SimpleGrantedAuthority("ROLE_" + role)) // Authorities (what can user do?)
                    );

                    // STEP 8: Add request details to authentication
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // STEP 9: Store authentication in SecurityContext
                    // Now Spring Security knows this request is authenticated
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token is invalid/expired/malformed
            // Log error but don't block request
            // Let SecurityConfig handle unauthorized access
            logger.error("JWT Authentication failed: " + e.getMessage());
        }

        // STEP 10: Pass request to next filter or controller
        filterChain.doFilter(request, response);
    }
}
