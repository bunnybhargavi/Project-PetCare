package com.pets.petcare.service;

import com.pets.petcare.dto.AdminStatsResponse;
import com.pets.petcare.entity.Order;
import com.pets.petcare.entity.User;
import com.pets.petcare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
public class AdminService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VeterinarianRepository veterinarianRepository;
    
    @Autowired
    private PetRepository petRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;

    public AdminStatsResponse getAdminStats() {
        AdminStatsResponse stats = new AdminStatsResponse();
        
        // Product Statistics
        stats.setTotalProducts(productRepository.count());
        stats.setActiveProducts(productRepository.countByActiveTrue());
        stats.setInactiveProducts(productRepository.countByActiveFalse());
        stats.setLowStockProducts(productRepository.countByStockLessThan(10));
        
        // Order Statistics
        stats.setTotalOrders(orderRepository.count());
        stats.setPendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING));
        stats.setCompletedOrders(orderRepository.countByStatus(Order.OrderStatus.DELIVERED));
        stats.setCancelledOrders(orderRepository.countByStatus(Order.OrderStatus.CANCELLED));
        
        // Revenue calculations
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatus(Order.OrderStatus.DELIVERED);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // Monthly revenue (current month)
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        BigDecimal monthlyRevenue = orderRepository.sumTotalAmountByStatusAndDateRange(
            Order.OrderStatus.DELIVERED, monthStart, monthEnd);
        stats.setMonthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO);
        
        // User Statistics
        stats.setTotalUsers(userRepository.count());
        stats.setTotalVendors(userRepository.countByRole(User.Role.VENDOR));
        stats.setTotalVets(veterinarianRepository.count());
        stats.setTotalPets(petRepository.count());
        
        // Appointment Statistics
        stats.setTotalAppointments(appointmentRepository.count());
        stats.setUpcomingAppointments(appointmentRepository.countUpcomingAppointments());
        stats.setCompletedAppointments(appointmentRepository.countCompletedAppointments());
        stats.setTodayAppointments(appointmentRepository.countTodayAppointments());
        
        return stats;
    }

    // Simplified vendor stats - remove vendor-specific methods that don't exist
    public AdminStatsResponse getVendorStats(Long vendorId) {
        AdminStatsResponse stats = new AdminStatsResponse();
        
        // Basic statistics only (vendor-specific methods not implemented yet)
        stats.setTotalProducts(productRepository.count());
        stats.setActiveProducts(productRepository.countByActiveTrue());
        stats.setInactiveProducts(productRepository.countByActiveFalse());
        stats.setLowStockProducts(productRepository.countByStockLessThan(10));
        
        stats.setTotalOrders(orderRepository.count());
        stats.setPendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING));
        stats.setCompletedOrders(orderRepository.countByStatus(Order.OrderStatus.DELIVERED));
        stats.setCancelledOrders(orderRepository.countByStatus(Order.OrderStatus.CANCELLED));
        
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatus(Order.OrderStatus.DELIVERED);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        return stats;
    }
}