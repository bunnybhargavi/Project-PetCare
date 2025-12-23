package com.pets.petcare.repository;

import com.pets.petcare.entity.Order;
import com.pets.petcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by user
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // Find orders by status
    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);
    
    // Find orders by user and status
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, Order.OrderStatus status);
    
    // Find orders by date range
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);
    
    // Find orders for vendor (orders containing vendor's products)
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.product.vendor = :vendor " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersForVendor(@Param("vendor") User vendor);
    
    // Find orders for vendor by status
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.product.vendor = :vendor AND o.status = :status " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersForVendorByStatus(@Param("vendor") User vendor, 
                                            @Param("status") Order.OrderStatus status);
    
    // Calculate total revenue for vendor
    @Query("SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE oi.product.vendor = :vendor AND o.status IN :statuses")
    BigDecimal calculateVendorRevenue(@Param("vendor") User vendor, 
                                      @Param("statuses") List<Order.OrderStatus> statuses);
    
    // Count orders for vendor
    @Query("SELECT COUNT(DISTINCT o) FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.product.vendor = :vendor")
    long countOrdersForVendor(@Param("vendor") User vendor);
    
    // Count pending orders for vendor
    @Query("SELECT COUNT(DISTINCT o) FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.product.vendor = :vendor AND o.status = 'PLACED'")
    long countPendingOrdersForVendor(@Param("vendor") User vendor);
    
    // Admin statistics methods
    long countByStatus(Order.OrderStatus status);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal sumTotalAmountByStatusAndDateRange(@Param("status") Order.OrderStatus status,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);
    
    // Vendor-specific statistics
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.orderItems oi WHERE oi.product.vendor.id = :vendorId")
    long countByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.orderItems oi " +
           "WHERE oi.product.vendor.id = :vendorId AND o.status = :status")
    long countByVendorIdAndStatus(@Param("vendorId") Long vendorId, @Param("status") Order.OrderStatus status);
    
    @Query("SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM OrderItem oi " +
           "JOIN oi.order o WHERE oi.product.vendor.id = :vendorId AND o.status = :status")
    BigDecimal sumTotalAmountByVendorIdAndStatus(@Param("vendorId") Long vendorId, 
                                                 @Param("status") Order.OrderStatus status);
}