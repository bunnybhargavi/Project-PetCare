package com.pets.petcare.repository;

import com.pets.petcare.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    
    Optional<Vendor> findByEmail(String email);
    
    List<Vendor> findByStatus(Vendor.VendorStatus status);
    
    Page<Vendor> findByStatus(Vendor.VendorStatus status, Pageable pageable);
    
    @Query("SELECT v FROM Vendor v WHERE v.businessName LIKE %:keyword% OR v.contactName LIKE %:keyword% OR v.email LIKE %:keyword%")
    Page<Vendor> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(v) FROM Vendor v WHERE v.status = :status")
    Long countByStatus(@Param("status") Vendor.VendorStatus status);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT v FROM Vendor v WHERE v.status = 'APPROVED'")
    List<Vendor> findActiveVendors();
}