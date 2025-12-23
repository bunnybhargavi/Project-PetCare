package com.pets.petcare.repository;

import com.pets.petcare.entity.Cart;
import com.pets.petcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    // Find cart by user
    Optional<Cart> findByUser(User user);
    
    // Find or create cart for user
    @Query("SELECT c FROM Cart c WHERE c.user = :user")
    Optional<Cart> findCartByUser(@Param("user") User user);
    
    // Delete cart by user
    void deleteByUser(User user);
}