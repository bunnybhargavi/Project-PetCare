package com.pets.petcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    
    // Product Statistics
    private Long totalProducts;
    private Long activeProducts;
    private Long inactiveProducts;
    private Long lowStockProducts; // Products with stock < 10
    
    // Order Statistics
    private Long totalOrders;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    
    // User Statistics
    private Long totalUsers;
    private Long totalVendors;
    private Long totalVets;
    private Long totalPets;
    
    // Appointment Statistics (for vet dashboard)
    private Long totalAppointments;
    private Long upcomingAppointments;
    private Long completedAppointments;
    private Long todayAppointments;
}