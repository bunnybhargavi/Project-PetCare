package com.pets.petcare.service;

import com.pets.petcare.dto.CartRequest;
import com.pets.petcare.dto.CartResponse;
import com.pets.petcare.entity.*;
import com.pets.petcare.exception.ResourceNotFoundException;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    /**
     * Add item to cart
     */
    public CartResponse addToCart(CartRequest request, String userEmail) {
        log.info("Adding item to cart for user: {}", userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check stock availability
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        // Get or create cart
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProduct(cart, product);
        
        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
            }
            
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        }
        
        log.info("Item added to cart successfully");
        return getCartByUser(userEmail);
    }
    
    /**
     * Update cart item quantity
     */
    public CartResponse updateCartItem(Long cartItemId, Integer quantity, String userEmail) {
        log.info("Updating cart item ID: {} to quantity: {} for user: {}", cartItemId, quantity, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        // Verify ownership
        if (!cartItem.getCart().getUser().equals(user)) {
            throw new RuntimeException("You can only update your own cart items");
        }
        
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cartItemRepository.delete(cartItem);
        } else {
            // Check stock availability
            if (cartItem.getProduct().getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock. Available: " + cartItem.getProduct().getStockQuantity());
            }
            
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
        
        log.info("Cart item updated successfully");
        return getCartByUser(userEmail);
    }
    
    /**
     * Remove item from cart
     */
    public CartResponse removeFromCart(Long cartItemId, String userEmail) {
        log.info("Removing cart item ID: {} for user: {}", cartItemId, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        // Verify ownership
        if (!cartItem.getCart().getUser().equals(user)) {
            throw new RuntimeException("You can only remove your own cart items");
        }
        
        cartItemRepository.delete(cartItem);
        log.info("Cart item removed successfully");
        
        return getCartByUser(userEmail);
    }
    
    /**
     * Get cart by user
     */
    @Transactional(readOnly = true)
    public CartResponse getCartByUser(String userEmail) {
        log.info("Fetching cart for user: {}", userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        
        if (cartOpt.isEmpty()) {
            // Return empty cart
            return CartResponse.builder()
                    .id(null)
                    .userId(user.getId())
                    .items(List.of())
                    .totalAmount(BigDecimal.ZERO)
                    .itemCount(0)
                    .build();
        }
        
        Cart cart = cartOpt.get();
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        
        return convertToResponse(cart, cartItems);
    }
    
    /**
     * Clear cart
     */
    public void clearCart(String userEmail) {
        log.info("Clearing cart for user: {}", userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cartItemRepository.deleteByCart(cart);
            log.info("Cart cleared successfully");
        }
    }
    
    /**
     * Get cart item count
     */
    @Transactional(readOnly = true)
    public int getCartItemCount(String userEmail) {
        log.info("Getting cart item count for user: {}", userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        
        if (cartOpt.isEmpty()) {
            return 0;
        }
        
        Cart cart = cartOpt.get();
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        
        return cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }
    
    /**
     * Convert Cart to CartResponse DTO
     */
    private CartResponse convertToResponse(Cart cart, List<CartItem> cartItems) {
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int itemCount = cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        
        List<CartResponse.CartItemResponse> itemResponses = cartItems.stream()
                .map(this::convertCartItemToResponse)
                .collect(Collectors.toList());
        
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .totalAmount(totalAmount)
                .itemCount(itemCount)
                .build();
    }
    
    /**
     * Convert CartItem to response
     */
    private CartResponse.CartItemResponse convertCartItemToResponse(CartItem item) {
        return CartResponse.CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productTitle(item.getProduct().getTitle())
                .productPrice(item.getProduct().getPrice())
                .productImageUrl(item.getProduct().getImageUrl())
                .quantity(item.getQuantity())
                .stockQuantity(item.getProduct().getStockQuantity())
                .build();
    }
}