package com.pets.petcare.repository;

import com.pets.petcare.entity.Cart;
import com.pets.petcare.entity.CartItem;
import com.pets.petcare.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByCart(Cart cart);
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    
    void deleteByCart(Cart cart);
    void deleteByCartAndProduct(Cart cart, Product product);
}