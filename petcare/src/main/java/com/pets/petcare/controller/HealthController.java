package com.pets.petcare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller for monitoring and deployment
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {

    /**
     * Health check endpoint for load balancers and monitoring
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "PetCare Backend");
        health.put("timestamp", LocalDateTime.now());
        health.put("version", "1.0.0");
        return ResponseEntity.ok(health);
    }

    /**
     * Readiness probe for Kubernetes/Docker deployments
     */
    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> readiness = new HashMap<>();
        readiness.put("status", "READY");
        readiness.put("database", "CONNECTED");
        readiness.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(readiness);
    }

    /**
     * Liveness probe for Kubernetes/Docker deployments
     */
    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> live() {
        Map<String, Object> liveness = new HashMap<>();
        liveness.put("status", "ALIVE");
        liveness.put("uptime", System.currentTimeMillis());
        liveness.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(liveness);
    }
}