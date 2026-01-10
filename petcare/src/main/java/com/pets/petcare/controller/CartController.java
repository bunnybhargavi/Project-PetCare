package com.pets.petcare.controller;

import com.pets.petcare.dto.ApiResponse;
import com.pets.petcare.dto.CartRequest;
import com.pets.petcare.dto.CartResponse;
import com.pets.petcare.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    /**
     * Get user's cart
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CartResponse cart = cartService.getCart(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get cart: " + e.getMessage()));
        }
    }

    /**
     * Add item to cart
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestBody CartRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CartResponse cart = cartService.addToCart(userEmail, request);
            return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to add item to cart: " + e.getMessage()));
        }
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CartResponse cart = cartService.updateCartItem(userEmail, cartItemId, quantity);
            return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update cart item: " + e.getMessage()));
        }
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CartResponse cart = cartService.removeFromCart(userEmail, cartItemId);
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to remove item from cart: " + e.getMessage()));
        }
    }

    /**
     * Clear cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            cartService.clearCart(userEmail);
            return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to clear cart: " + e.getMessage()));
        }
    }
}