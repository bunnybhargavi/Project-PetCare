import React, { useState } from 'react';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { cartService } from '../../services/cartService';

const CartModal = ({ cart, onClose, onUpdateCart, onCheckout }) => {
    const [loading, setLoading] = useState(false);

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
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
            setLoading(true);
            await cartService.removeFromCart(cartItemId);
            await onUpdateCart();
        } catch (error) {
            console.error('Failed to remove cart item:', error);
            alert('Failed to remove cart item: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
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

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="cart-modal empty" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Shopping Cart</h2>
                        <button className="modal-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                        <button className="continue-shopping-btn" onClick={onClose}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Shopping Cart ({cart.totalItems} items)</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="cart-content">
                    <div className="cart-items">
                        {cart.items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image">
                                    {(() => {
                                        // Prioritize vendor-uploaded images
                                        if (item.product.images && item.product.images.length > 0) {
                                            const imageUrl = item.product.images[0].startsWith('http') 
                                                ? item.product.images[0] 
                                                : `http://localhost:8080${item.product.images[0]}`;
                                            return (
                                                <img 
                                                    src={imageUrl}
                                                    alt={item.product.title}
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik00MCA0MEM0Ni4yMDkyIDQwIDUxLjIgMzQuOTI4IDUxLjIgMjguOEM1MS4yIDIyLjY3MiA0Ni4yMDkyIDE3LjYgNDAgMTcuNkMzMy43OTA4IDE3LjYgMjguOCAyMi42NzIgMjguOCAyOC44QzI4OCAzNC45MjggMzMuNzkwOCA0MCA0MCA0MFoiIGZpbGw9IiNBMEFFQzAiLz4KPHBhdGggZD0iTTQwIDQ4QzUwLjUwOTYgNDggNTkuMiA1My44OTg0IDU5LjIgNjEuMkg1OS4yVjY0SDIwLjhWNjEuMkMyMC44IDUzLjg5ODQgMjkuNDkwNCA0OCA0MCA0OFoiIGZpbGw9IiNBMEFFQzAiLz4KPC9zdmc+Cg==';
                                                    }}
                                                />
                                            );
                                        } else {
                                            return <div className="image-placeholder">📦</div>;
                                        }
                                    })()}
                                </div>

                                <div className="item-details">
                                    <h4 className="item-title">{item.product.title}</h4>
                                    <p className="item-brand">{item.product.brand || item.product.categoryDisplayName}</p>
                                    <div className="item-price">
                                        ₹{item.unitPrice?.toFixed(2)} each
                                    </div>
                                </div>

                                <div className="item-quantity">
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                        disabled={loading || item.quantity <= 1}
                                        className="quantity-btn"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                        disabled={loading || item.quantity >= item.product.stock}
                                        className="quantity-btn"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="item-total">
                                    ₹{item.totalPrice?.toFixed(2)}
                                </div>

                                <button 
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={loading}
                                    className="remove-btn"
                                    title="Remove item"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal ({cart.totalItems} items):</span>
                            <span>₹{cart.totalAmount?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>{cart.totalAmount >= 500 ? 'FREE' : '₹59.99'}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (8%):</span>
                            <span>₹{(cart.totalAmount * 0.08)?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>
                                ₹{(cart.totalAmount + 
                                   (cart.totalAmount >= 500 ? 0 : 59.99) + 
                                   (cart.totalAmount * 0.08))?.toFixed(2)}
                            </span>
                        </div>

                        {cart.totalAmount < 500 && (
                            <div className="shipping-notice">
                                Add ₹{(500 - cart.totalAmount)?.toFixed(2)} more for FREE shipping!
                            </div>
                        )}
                    </div>
                </div>

                <div className="cart-actions">
                    <button 
                        onClick={handleClearCart}
                        disabled={loading}
                        className="clear-cart-btn"
                    >
                        Clear Cart
                    </button>
                    
                    <div className="action-buttons">
                        <button 
                            onClick={onClose}
                            className="continue-shopping-btn"
                        >
                            Continue Shopping
                        </button>
                        
                        <button 
                            onClick={onCheckout}
                            disabled={loading}
                            className="checkout-btn"
                        >
                            <FaShoppingCart />
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartModal;