import React, { useState } from 'react';
import { FaTimes, FaShoppingCart, FaHeart, FaStar, FaPlus, FaMinus } from 'react-icons/fa';

const ProductModal = ({ product, onClose, onAddToCart, cartLoading, onBuyNow }) => {
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
        <div className="shop-modal-overlay" onClick={onClose}>
            <div className="shop-product-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-content">
                    <div className="modal-left">
                        <div className="product-images">
                            <div className="main-image">
                                <img
                                    src={(() => {
                                        // First priority: Use actual uploaded images if available
                                        if (product.images && product.images.length > 0) {
                                            const imageUrl = product.images[selectedImageIndex] || product.images[0];
                                            return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
                                        }

                                        // Second priority: Specific product images based on product title and category
                                        const productImageMap = {
                                            // Car Safety Harness (SafeRide) - TRAVEL category - Dog harness product
                                            'Car Safety Harness': 'https://m.media-amazon.com/images/I/71oCswWyDbL.jpg',
                                            // Airline Approved Pet Carrier (SkyPet) - TRAVEL category - Pet carrier bag
                                            'Airline Approved Pet Carrier': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnHvTSMTUlkcGAtLBWnnVjBF-H_u4lixQvEA&s',
                                            // Anti-Bark Training Collar (QuietPaws) - TRAINING category - Training collar device
                                            'Anti-Bark Training Collar': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm2xOVYQ9O4TfcDsV-27DLnWX3iO7u5Old3w&s',
                                            // LED Safety Dog Collar (SafeWalk) - ACCESSORIES category - LED collar product
                                            'LED Safety Dog Collar': 'https://qpets.in/cdn/shop/files/71s0pKxjegL_f84a942f-02fa-4016-bb22-5f594c65cdd1.jpg?v=1766180936'
                                        };

                                        // Check if this is one of the specific products
                                        const specificImage = productImageMap[product.title];
                                        if (specificImage) {
                                            return `${specificImage}&t=${Date.now()}`;
                                        }

                                        // Third priority: Category-based fallback images
                                        const categoryImages = {
                                            'FOOD': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop&auto=format',
                                            'TOYS': 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=400&fit=crop&auto=format',
                                            'HEALTH': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=400&fit=crop&auto=format',
                                            'GROOMING': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop&auto=format',
                                            'ACCESSORIES': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=400&fit=crop&auto=format',
                                            'BEDS': 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=500&h=400&fit=crop&auto=format',
                                            'TRAINING': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=400&fit=crop&auto=format',
                                            'TRAVEL': 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&h=400&fit=crop&auto=format'
                                        };
                                        return categoryImages[product.category] || 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=400&fit=crop&auto=format';
                                    })()}
                                    alt={product.title}
                                />

                                {getDiscountPercentage() > 0 && (
                                    <div className="discount-badge">
                                        -{getDiscountPercentage()}%
                                    </div>
                                )}
                            </div>

                            {/* Image Thumbnails for multiple vendor images */}
                            {product.images && product.images.length > 1 && (
                                <div className="image-thumbnails">
                                    {product.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image.startsWith('http') ? image : `http://localhost:8080${image}`}
                                            alt={`${product.title} ${index + 1}`}
                                            className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                                            onClick={() => setSelectedImageIndex(index)}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ))}
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

                                    {product.inStock && (
                                        <button
                                            className="buy-now-btn secondary"
                                            onClick={() => onBuyNow && onBuyNow(product, quantity)}
                                            disabled={cartLoading}
                                        >
                                            <span className="lightning-icon">⚡</span>
                                            Buy Now
                                        </button>
                                    )}

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