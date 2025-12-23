package com.pets.petcare.controller;

import com.pets.petcare.dto.CartRequest;
import com.pets.petcare.dto.CartResponse;
import com.pets.petcare.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CartController {
    
    private final CartService cartService;
    
    /**
     * Add item to cart
     */
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody CartRequest request,
            Authentication authentication) {
        
        log.info("Adding item to cart for user: {}", authentication.getName());
        CartResponse response = cartService.addToCart(request, authentication.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user's cart
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        log.info("Fetching cart for user: {}", authentication.getName());
        CartResponse cart = cartService.getCartByUser(authentication.getName());
        return ResponseEntity.ok(cart);
    }
    
    /**
     * Update cart item quantity
     */
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        
        log.info("Updating cart item ID: {} to quantity: {}", cartItemId, quantity);
        CartResponse response = cartService.updateCartItem(cartItemId, quantity, authentication.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove item from cart
     */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {
        
        log.info("Removing cart item ID: {}", cartItemId);
        CartResponse response = cartService.removeFromCart(cartItemId, authentication.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Clear cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        log.info("Clearing cart for user: {}", authentication.getName());
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get cart item count
     */
    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount(Authentication authentication) {
        log.info("Getting cart item count for user: {}", authentication.getName());
        int count = cartService.getCartItemCount(authentication.getName());
        return ResponseEntity.ok(count);
    }
}