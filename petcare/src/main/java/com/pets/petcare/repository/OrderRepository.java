package com.pets.petcare.repository;

import com.pets.petcare.entity.Order;
import com.pets.petcare.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findByUser(User user);
    Page<Order> findByUser(User user, Pageable pageable);
    
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Order> findByStatus(Order.OrderStatus status);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    
    List<Order> findByUserAndStatus(User user, Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                               @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user")
    Long countByUser(@Param("user") User user);

    // Admin methods for statistics
    long countByStatus(Order.OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalAmountByStatusAndDateRange(@Param("status") Order.OrderStatus status,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);
    
    // Vendor-specific methods
    @Query("SELECT o.status, COUNT(o), SUM(o.totalAmount) FROM Order o " +
           "JOIN o.items oi JOIN oi.product p " +
           "WHERE p.vendor.id = :vendorId " +
           "GROUP BY o.status")
    List<Object[]> getVendorOrderStats(@Param("vendorId") Long vendorId);
    
    @Query("SELECT o.id, o.orderNumber, o.user.name, o.user.email, o.status, o.paymentStatus, o.totalAmount, " +
           "oi.id, oi.product.id, oi.product.title, oi.quantity, oi.unitPrice, oi.totalPrice " +
           "FROM Order o JOIN o.items oi JOIN oi.product p " +
           "WHERE p.vendor.id = :vendorId " +
           "ORDER BY o.createdAt DESC")
    List<Object[]> getVendorOrders(@Param("vendorId") Long vendorId);
}