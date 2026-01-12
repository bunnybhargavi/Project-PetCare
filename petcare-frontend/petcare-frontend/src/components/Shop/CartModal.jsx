import React, { useState } from 'react';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaShoppingCart, FaTag } from 'react-icons/fa';
import { cartService } from '../../services/cartService';

const CartModal = ({ cart, onClose, onUpdateCart, onCheckout }) => {
    const [loading, setLoading] = useState(false);
    const [removingItems, setRemovingItems] = useState(new Set());

    const getProductImage = (product) => {
        // First priority: Use actual uploaded images if available
        if (product.images && product.images.length > 0) {
            const imageUrl = product.images[0];
            return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
        }

        // Second priority: Specific product image mapping
        const productImageMap = {
            'Car Safety Harness': 'https://m.media-amazon.com/images/I/71oCswWyDbL.jpg',
            'Airline Approved Pet Carrier': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnHvTSMTUlkcGAtLBWnnVjBF-H_u4lixQvEA&s',
            'Anti-Bark Training Collar': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm2xOVYQ9O4TfcDsV-27DLnWX3iO7u5Old3w&s',
            'LED Safety Dog Collar': 'https://qpets.in/cdn/shop/files/71s0pKxjegL_f84a942f-02fa-4016-bb22-5f594c65cdd1.jpg?v=1766180936',
            'Premium Dog Food - Chicken & Rice': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop&auto=format',
            'Interactive Puzzle Toy': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=400&fit=crop&auto=format',
            'Orthopedic Dog Bed': 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=400&fit=crop&auto=format',
            'Professional Dog Brush': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&h=400&fit=crop&auto=format'
        };

        const specificImage = productImageMap[product.title];
        if (specificImage) {
            return specificImage;
        }

        // Third priority: Category-based fallback images
        const categoryImages = {
            'FOOD': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop&auto=format',
            'TOYS': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=400&fit=crop&auto=format',
            'HEALTH': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=400&fit=crop&auto=format',
            'GROOMING': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&h=400&fit=crop&auto=format',
            'ACCESSORIES': 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500&h=400&fit=crop&auto=format',
            'BEDS': 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=400&fit=crop&auto=format',
            'TRAINING': 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500&h=400&fit=crop&auto=format',
            'TRAVEL': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop&auto=format'
        };

        return categoryImages[product.category] || 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=400&fit=crop&auto=format';
    };

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            setLoading(true);
            await cartService.updateCartItem(cartItemId, newQuantity);
            await onUpdateCart();
        } catch (error) {
            console.error('Failed to update cart item:', error);
            alert('Failed to update cart item: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            setRemovingItems(prev => new Set([...prev, cartItemId]));
            await cartService.removeFromCart(cartItemId);
            await onUpdateCart();
        } catch (error) {
            console.error('Failed to remove cart item:', error);
            alert('Failed to remove cart item: ' + (error.response?.data?.message || error.message));
        } finally {
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart? 🐾')) {
            try {
                setLoading(true);
                await cartService.clearCart();
                await onUpdateCart();
            } catch (error) {
                console.error('Failed to clear cart:', error);
                alert('Failed to clear cart: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    const subtotal = cart?.totalAmount || 0;
    const shippingCost = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    // Empty Cart State
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="pet-cart-overlay" onClick={onClose}>
                <div className="pet-cart-drawer empty" onClick={(e) => e.stopPropagation()}>
                    {/* Background Pattern */}
                    <div className="pet-cart-bg-pattern">
                        <span className="pet-bg-paw">🐾</span>
                        <span className="pet-bg-paw">🐾</span>
                        <span className="pet-bg-paw">🐾</span>
                    </div>

                    {/* Header */}
                    <div className="pet-cart-header">
                        <div className="pet-cart-title">
                            <span className="pet-cart-icon">🛒</span>
                            <h2>My Cart</h2>
                            <span className="pet-item-count">0</span>
                        </div>
                        <button className="pet-cart-close" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Empty State */}
                    <div className="pet-empty-cart">
                        <div className="pet-empty-illustration">
                            <div className="pet-empty-cart-icon">🛒</div>
                            <div className="pet-sad-pet">😿</div>
                            <div className="pet-empty-paws">
                                <span>🐾</span>
                                <span>🐾</span>
                                <span>🐾</span>
                            </div>
                        </div>
                        <h3>Your cart is empty</h3>
                        <p>Your furry friend's wishlist is waiting to be filled!</p>
                        <button className="pet-start-shopping-btn" onClick={onClose}>
                            <span>Start Shopping</span>
                            <span className="pet-btn-paw">🐾</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pet-cart-overlay" onClick={onClose}>
            <div className="pet-cart-drawer" onClick={(e) => e.stopPropagation()}>
                {/* Background Pattern */}
                <div className="pet-cart-bg-pattern">
                    <span className="pet-bg-paw">🐾</span>
                    <span className="pet-bg-paw">🐾</span>
                    <span className="pet-bg-paw">🐾</span>
                    <span className="pet-bg-paw">🐾</span>
                </div>

                {/* Header */}
                <div className="pet-cart-header">
                    <div className="pet-cart-title">
                        <span className="pet-cart-icon">🛒</span>
                        <h2>My Cart</h2>
                        <span className="pet-item-count">{cart.totalItems}</span>
                    </div>
                    <button className="pet-cart-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Paw Print Divider */}
                <div className="pet-paw-divider">
                    <span>🐾</span>
                    <span>🐾</span>
                    <span>🐾</span>
                </div>

                {/* Cart Items - Scrollable Area */}
                <div className="pet-cart-content">
                    <div className="pet-cart-items-container">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className={`pet-cart-item-card ${removingItems.has(item.id) ? 'removing' : ''}`}
                            >
                                {/* Left Side - Product Image (30%) */}
                                <div className="pet-item-image-section">
                                    <img
                                        src={getProductImage(item.product)}
                                        alt={item.product.title}
                                        className="pet-item-product-image"
                                    />
                                </div>

                                {/* Middle Section - Product Details (50%) */}
                                <div className="pet-item-details-section">
                                    <h4 className="pet-item-product-name">{item.product.title}</h4>
                                    <div className="pet-item-brand-info">
                                        <FaTag className="pet-brand-icon" />
                                        <span className="pet-brand-name">{item.product.brand || 'PawHaven'}</span>
                                    </div>
                                    <div className="pet-item-category-badge">
                                        {item.product.categoryDisplayName || item.product.category}
                                    </div>
                                    <div className="pet-item-unit-price">
                                        ₹{item.unitPrice?.toFixed(2)} each
                                    </div>
                                </div>

                                {/* Right Side - Controls (20%) */}
                                <div className="pet-item-controls-section">
                                    {/* Quantity Controls - Vertical Stack */}
                                    <div className="pet-quantity-controls-vertical">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            disabled={loading || item.quantity >= item.product.stock}
                                            className="pet-quantity-btn-vertical plus"
                                            title="Increase quantity"
                                        >
                                            <FaPlus />
                                        </button>
                                        <span className="pet-quantity-display">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            disabled={loading || item.quantity <= 1}
                                            className="pet-quantity-btn-vertical minus"
                                            title="Decrease quantity"
                                        >
                                            <FaMinus />
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        disabled={removingItems.has(item.id)}
                                        className="pet-remove-btn-vertical"
                                        title="Remove item"
                                    >
                                        {removingItems.has(item.id) ? (
                                            <div className="pet-loading-paw">🐾</div>
                                        ) : (
                                            <FaTrash />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Summary (Sticky Bottom) */}
                <div className="pet-cart-summary">
                    <div className="pet-summary-content">
                        {/* Summary Breakdown */}
                        <div className="pet-summary-breakdown">
                            <div className="pet-summary-row">
                                <span>Subtotal ({cart.totalItems} items):</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="pet-summary-row">
                                <span>Shipping:</span>
                                <span className={shippingCost === 0 ? 'free' : ''}>
                                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="pet-summary-row">
                                <span>Tax (8%):</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>

                            {/* Paw Print Divider */}
                            <div className="pet-summary-divider">
                                <span>🐾</span>
                                <span>🐾</span>
                                <span>🐾</span>
                            </div>

                            <div className="pet-summary-row total">
                                <span>Total:</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>

                            {/* Free Shipping Notice */}
                            {subtotal < 50 && (
                                <div className="pet-shipping-notice">
                                    <span className="pet-notice-icon">💡</span>
                                    <span>Add ₹{(50 - subtotal).toFixed(2)} more for FREE shipping!</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pet-cart-actions">
                            {/* Proceed to Checkout Button */}
                            <button
                                onClick={onCheckout}
                                disabled={loading}
                                className="pet-checkout-btn"
                            >
                                {loading ? (
                                    <>
                                        <div className="pet-loading-paws">
                                            <span>🐾</span>
                                            <span>🐾</span>
                                        </div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaShoppingCart />
                                        <span>Proceed to Checkout</span>
                                        <span className="pet-btn-paw">🐾</span>
                                    </>
                                )}
                            </button>

                            {/* Continue Shopping Link */}
                            <button
                                onClick={onClose}
                                className="pet-continue-shopping"
                            >
                                Continue Shopping
                            </button>

                            {/* Clear Cart Link */}
                            <button
                                onClick={handleClearCart}
                                disabled={loading}
                                className="pet-clear-cart"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartModal;