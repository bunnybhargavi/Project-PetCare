import React, { useState } from 'react';
import { FaShoppingCart, FaHeart, FaStar, FaEye } from 'react-icons/fa';

const ProductCard = ({ product, onAddToCart, onViewDetails, cartLoading, viewMode = 'grid' }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        onAddToCart(product.id, quantity);
    };

    const handleViewDetails = () => {
        onViewDetails(product);
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
        <div className={`product-card ${viewMode}`} onClick={handleViewDetails}>
            <div className="product-image-container">
                {(() => {
                    // Prioritize vendor-uploaded images
                    if (product.images && product.images.length > 0) {
                        const imageUrl = product.images[0].startsWith('http') ? product.images[0] : `http://localhost:8080${product.images[0]}`;
                        return (
                            <img 
                                src={imageUrl} 
                                alt={product.title}
                                className="product-image"
                                onError={(e) => {
                                    // Use a beautiful fallback image
                                    e.target.src = `https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&auto=format`;
                                }}
                            />
                        );
                    } else {
                        return (
                            <div className="product-placeholder">
                                <div className="placeholder-content">
                                    <span className="placeholder-icon">🐾</span>
                                    <span className="placeholder-text">Pet Product</span>
                                </div>
                            </div>
                        );
                    }
                })()}

                {getDiscountPercentage() > 0 && (
                    <div className="discount-badge">
                        -{getDiscountPercentage()}%
                    </div>
                )}

                <div className="product-overlay">
                    <button 
                        className="overlay-btn view-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails();
                        }}
                    >
                        <FaEye />
                    </button>
                    <button 
                        className={`overlay-btn like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLiked(!isLiked);
                        }}
                    >
                        <FaHeart />
                    </button>
                </div>

                {!product.inStock && (
                    <div className="out-of-stock-overlay">
                        <span>Out of Stock</span>
                    </div>
                )}
            </div>

            <div className="product-info">
                <div className="product-brand">
                    {product.brand || product.categoryDisplayName}
                </div>
                
                <h3 className="product-title">{product.title}</h3>
                
                <div className="product-rating">
                    <div className="stars">
                        {renderStars(product.rating || 0)}
                    </div>
                    <span className="rating-text">
                        ({product.reviewCount || 0} reviews)
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
                        </>
                    ) : (
                        <span className="current-price">
                            ₹{product.price?.toFixed(2)}
                        </span>
                    )}
                </div>

                <div className="product-stock">
                    {product.inStock ? (
                        <span className="in-stock">✅ In Stock ({product.stock} available)</span>
                    ) : (
                        <span className="out-of-stock">❌ Out of Stock</span>
                    )}
                </div>

                <div className="product-actions">
                    <div className="quantity-selector">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setQuantity(Math.max(1, quantity - 1));
                            }}
                            className="quantity-btn"
                        >
                            -
                        </button>
                        <span className="quantity">{quantity}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setQuantity(Math.min(product.stock || 1, quantity + 1));
                            }}
                            className="quantity-btn"
                        >
                            +
                        </button>
                    </div>

                    <button 
                        className="add-to-cart-btn"
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
                </div>
            </div>
        </div>
    );
};

export default ProductCard;