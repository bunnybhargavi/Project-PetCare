import React, { useState } from 'react';
import { FaTimes, FaShoppingCart, FaHeart, FaStar, FaPlus, FaMinus } from 'react-icons/fa';

const ProductModal = ({ product, onClose, onAddToCart, cartLoading }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);

    const handleAddToCart = () => {
        onAddToCart(product.id, quantity);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="star filled" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStar key="half" className="star half" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
        }

        return stars;
    };

    const getDiscountPercentage = () => {
        if (product.discountPercentage && product.discountPercentage > 0) {
            return Math.round(product.discountPercentage);
        }
        return 0;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-content">
                    <div className="modal-left">
                        <div className="product-images">
                            <div className="main-image">
                                {(() => {
                                    // Prioritize vendor-uploaded images
                                    if (product.images && product.images.length > 0) {
                                        const imageUrl = product.images[selectedImageIndex].startsWith('http') 
                                            ? product.images[selectedImageIndex] 
                                            : `http://localhost:8080${product.images[selectedImageIndex]}`;
                                        return (
                                            <img 
                                                src={imageUrl}
                                                alt={product.title}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0yMDAgMjAwQzIzMS4wNDYgMjAwIDI1NiAxNzQuOTI4IDI1NiAxNDRDMjU2IDExMy4wNzIgMjMxLjA0NiA4OCAyMDAgODhDMTY4Ljk1NCA4OCAxNDQgMTEzLjA3MiAxNDQgMTQ0QzE0NCAxNzQuOTI4IDE2OC45NTQgMjAwIDIwMCAyMDBaIiBmaWxsPSIjQTBBRUMwIi8+CjxwYXRoIGQ9Ik0yMDAgMjQwQzI1Mi41NDggMjQwIDI5NiAyNjkuNDkyIDI5NiAzMDZIMjk2VjMyMEgxMDRWMzA2QzEwNCAyNjkuNDkyIDE0Ny40NTIgMjQwIDIwMCAyNDBaIiBmaWxsPSIjQTBBRUMwIi8+Cjwvc3ZnPgo=';
                                                }}
                                            />
                                        );
                                    } else {
                                        return (
                                            <div className="image-placeholder">
                                                <span className="placeholder-icon">📦</span>
                                            </div>
                                        );
                                    }
                                })()}

                                {getDiscountPercentage() > 0 && (
                                    <div className="discount-badge">
                                        -{getDiscountPercentage()}%
                                    </div>
                                )}
                            </div>

                            {product.images && product.images.length > 1 && (
                                <div className="image-thumbnails">
                                    {product.images.map((image, index) => {
                                        const thumbnailUrl = image.startsWith('http') ? image : `http://localhost:8080${image}`;
                                        return (
                                            <img
                                                key={index}
                                                src={thumbnailUrl}
                                                alt={`${product.title} ${index + 1}`}
                                                className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                                                onClick={() => setSelectedImageIndex(index)}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik00MCA0MEM0Ni4yMDkyIDQwIDUxLjIgMzQuOTI4IDUxLjIgMjguOEM1MS4yIDIyLjY3MiA0Ni4yMDkyIDE3LjYgNDAgMTcuNkMzMy43OTA4IDE3LjYgMjguOCAyMi42NzIgMjguOCAyOC44QzI4OCAzNC45MjggMzMuNzkwOCA0MCA0MCA0MFoiIGZpbGw9IiNBMEFFQzAiLz4KPHBhdGggZD0iTTQwIDQ4QzUwLjUwOTYgNDggNTkuMiA1My44OTg0IDU5LjIgNjEuMkg1OS4yVjY0SDIwLjhWNjEuMkMyMC44IDUzLjg5ODQgMjkuNDkwNCA0OCA0MCA0OFoiIGZpbGw9IiNBMEFFQzAiLz4KPC9zdmc+Cg==';
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-right">
                        <div className="product-details">
                            <div className="product-brand">
                                {product.brand || product.categoryDisplayName}
                            </div>

                            <h2 className="product-title">{product.title}</h2>

                            <div className="product-rating">
                                <div className="stars">
                                    {renderStars(product.rating || 0)}
                                </div>
                                <span className="rating-text">
                                    {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                                </span>
                            </div>

                            <div className="product-price">
                                {getDiscountPercentage() > 0 ? (
                                    <>
                                        <span className="discounted-price">
                                            ₹{product.discountedPrice?.toFixed(2)}
                                        </span>
                                        <span className="original-price">
                                            ₹{product.price?.toFixed(2)}
                                        </span>
                                        <span className="savings">
                                            You save ₹{(product.price - product.discountedPrice)?.toFixed(2)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="current-price">
                                        ₹{product.price?.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <div className="product-stock">
                                {product.inStock ? (
                                    <span className="in-stock">
                                        ✅ In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="out-of-stock">❌ Out of Stock</span>
                                )}
                            </div>

                            <div className="product-description">
                                <h4>Description</h4>
                                <p>{product.description}</p>
                            </div>

                            <div className="product-info-grid">
                                <div className="info-item">
                                    <span className="info-label">Category:</span>
                                    <span className="info-value">{product.categoryDisplayName}</span>
                                </div>
                                {product.brand && (
                                    <div className="info-item">
                                        <span className="info-label">Brand:</span>
                                        <span className="info-value">{product.brand}</span>
                                    </div>
                                )}
                                {product.sku && (
                                    <div className="info-item">
                                        <span className="info-label">SKU:</span>
                                        <span className="info-value">{product.sku}</span>
                                    </div>
                                )}
                            </div>

                            <div className="purchase-section">
                                <div className="quantity-section">
                                    <label>Quantity:</label>
                                    <div className="quantity-controls">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="quantity-btn"
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="quantity-display">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                                            className="quantity-btn"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button 
                                        className="add-to-cart-btn primary"
                                        onClick={handleAddToCart}
                                        disabled={!product.inStock || cartLoading}
                                    >
                                        {cartLoading ? (
                                            <span className="loading-spinner"></span>
                                        ) : (
                                            <>
                                                <FaShoppingCart />
                                                Add to Cart
                                            </>
                                        )}
                                    </button>

                                    <button 
                                        className={`wishlist-btn ${isLiked ? 'liked' : ''}`}
                                        onClick={() => setIsLiked(!isLiked)}
                                    >
                                        <FaHeart />
                                        {isLiked ? 'Added to Wishlist' : 'Add to Wishlist'}
                                    </button>
                                </div>

                                <div className="total-price">
                                    <span>Total: ₹{((getDiscountPercentage() > 0 ? product.discountedPrice : product.price) * quantity)?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;