package com.pets.petcare.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Product Entity - Marketplace products
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Vendor relationship (can be a Vet or dedicated Vendor)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    @JsonManagedReference
    private User vendor;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(nullable = false)
    private Integer stockQuantity = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;
    
    private String imageUrl;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    // SEO and search
    private String tags; // comma-separated for search
    private String brand;
    private Double rating = 0.0;
    private Integer reviewCount = 0;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum ProductCategory {
        FOOD,           // Pet food, treats
        TOYS,           // Toys and entertainment
        MEDICINE,       // Medications, supplements
        ACCESSORIES,    // Collars, leashes, beds
        GROOMING,       // Shampoos, brushes
        HEALTHCARE,     // First aid, health monitors
        TRAINING,       // Training aids, books
        OTHER
    }
}