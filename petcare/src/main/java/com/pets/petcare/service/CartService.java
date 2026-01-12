package com.pets.petcare.service;

import com.pets.petcare.dto.CartRequest;
import com.pets.petcare.dto.CartResponse;
import com.pets.petcare.dto.ProductResponse;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    /**
     * Get user's cart
     */
    public CartResponse getCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);
        return mapToResponse(cart);
    }

    /**
     * Add item to cart
     */
    @Transactional
    public CartResponse addToCart(String userEmail, CartRequest request) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getActive()) {
            throw new RuntimeException("Product is not available");
        }

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
        }

        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(null);

        if (existingItem != null) {
            // Update quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setUnitPrice(product.getDiscountedPrice());
            cartItemRepository.save(cartItem);
        }

        log.info("Added {} x {} to cart for user: {}", request.getQuantity(), product.getTitle(), userEmail);
        
        return mapToResponse(cart);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartResponse updateCartItem(String userEmail, Long cartItemId, Integer quantity) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            log.info("Removed item from cart for user: {}", userEmail);
        } else {
            if (cartItem.getProduct().getStock() < quantity) {
                throw new RuntimeException("Insufficient stock. Available: " + cartItem.getProduct().getStock());
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
            log.info("Updated cart item quantity to {} for user: {}", quantity, userEmail);
        }

        return mapToResponse(cart);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public CartResponse removeFromCart(String userEmail, Long cartItemId) {
        User user = getUserByEmail(userEmail);
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        cartItemRepository.delete(cartItem);
        log.info("Removed item from cart for user: {}", userEmail);

        return mapToResponse(cart);
    }

    /**
     * Clear cart
     */
    @Transactional
    public void clearCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        Cart cart = cartRepository.findByUser(user).orElse(null);
        
        if (cart != null) {
            cartItemRepository.deleteByCart(cart);
            log.info("Cleared cart for user: {}", userEmail);
        }
    }

    /**
     * Get or create cart for user
     */
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Get user by email
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Map Cart to CartResponse
     */
    private CartResponse mapToResponse(Cart cart) {
        // Refresh cart items
        List<CartItem> items = cartItemRepository.findByCart(cart);
        
        List<CartResponse.CartItemResponse> itemResponses = items.stream()
                .map(this::mapCartItemToResponse)
                .collect(Collectors.toList());

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalAmount(calculateTotalAmount(items))
                .totalItems(calculateTotalItems(items))
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    /**
     * Map CartItem to CartItemResponse
     */
    private CartResponse.CartItemResponse mapCartItemToResponse(CartItem cartItem) {
        ProductResponse productResponse = productService.getProductById(cartItem.getProduct().getId());
        
        return CartResponse.CartItemResponse.builder()
                .id(cartItem.getId())
                .product(productResponse)
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .totalPrice(cartItem.getTotalPrice())
                .createdAt(cartItem.getCreatedAt())
                .build();
    }

    /**
     * Calculate total amount
     */
    private BigDecimal calculateTotalAmount(List<CartItem> items) {
        return items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate total items
     */
    private Integer calculateTotalItems(List<CartItem> items) {
        return items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }
}