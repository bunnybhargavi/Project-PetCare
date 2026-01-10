package com.pets.petcare.repository;

import com.pets.petcare.entity.Cart;
import com.pets.petcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    Optional<Cart> findByUser(User user);
    Optional<Cart> findByUserId(Long userId);
    
    void deleteByUser(User user);
}