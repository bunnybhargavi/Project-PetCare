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
    
    // Find cart items by cart
    List<CartItem> findByCart(Cart cart);
    
    // Find specific cart item by cart and product
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    
    // Delete cart items by cart
    void deleteByCart(Cart cart);
    
    // Count items in cart
    long countByCart(Cart cart);
}