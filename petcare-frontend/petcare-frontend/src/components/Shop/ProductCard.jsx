import React, { useState } from 'react';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';

const ProductCard = ({ product, onAddToCart, onViewDetails, cartLoading, viewMode, onToggleLike, likedProducts = [], onBuyNow }) => {
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);
    const discountedPrice = product.discountedPrice || product.price;
    const hasDiscount = product.discountPercentage > 0;
    const rating = product.rating || 0;
    const isLiked = likedProducts.includes(product.id);

    // Debug log to check if component is updating
    console.log('ProductCard rendering with category:', product.category, 'title:', product.title);
    console.log('Image URL will be:', (() => {
        const productImageMap = {
            'Car Safety Harness': 'https://images-na.ssl-images-amazon.com/images/I/51OXKcfXPfL.jpg',
            'Airline Approved Pet Carrier': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnHvTSMTUlkcGAtLBWnnVjBF-H_u4lixQvEA&s',
            'Anti-Bark Training Collar': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm2xOVYQ9O4TfcDsV-27DLnWX3iO7u5Old3w&s',
            'LED Safety Dog Collar': 'https://qpets.in/cdn/shop/files/71s0pKxjegL_f84a942f-02fa-4016-bb22-5f594c65cdd1.jpg?v=1766180936'
        };
        const specificImage = productImageMap[product.title];
        if (specificImage) {
            return `${specificImage}&t=${Date.now()}`;
        }
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
    })());

    const handleLikeClick = () => {
        setIsLikeAnimating(true);
        onToggleLike(product.id);

        // Reset animation after it completes
        setTimeout(() => {
            setIsLikeAnimating(false);
        }, 600);
    };

    const renderPawRating = (rating) => {
        const paws = [];
        const fullPaws = Math.floor(rating);
        const hasHalfPaw = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullPaws) {
                paws.push(<span key={i} className="paw-rating full">🐾</span>);
            } else if (i === fullPaws && hasHalfPaw) {
                paws.push(<span key={i} className="paw-rating half">🐾</span>);
            } else {
                paws.push(<span key={i} className="paw-rating empty">🐾</span>);
            }
        }
        return paws;
    };

    return (
        <div className={`pet-product-card ${viewMode} ${!product.inStock ? 'out-of-stock' : ''}`}>
            {/* Product Image */}
            <div className="pet-product-image">
                <img
                    src={(() => {
                        // First priority: Use actual uploaded images if available
                        if (product.images && product.images.length > 0) {
                            const imageUrl = product.images[0];
                            // Check if it's already a full URL or needs the server prefix
                            return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
                        }

                        // Second priority: Specific product images based on product title and category
                        const productImageMap = {
                            'Car Safety Harness': 'https://m.media-amazon.com/images/I/71oCswWyDbL.jpg',
                            'Airline Approved Pet Carrier': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnHvTSMTUlkcGAtLBWnnVjBF-H_u4lixQvEA&s',
                            'Anti-Bark Training Collar': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm2xOVYQ9O4TfcDsV-27DLnWX3iO7u5Old3w&s',
                            'LED Safety Dog Collar': 'https://qpets.in/cdn/shop/files/71s0pKxjegL_f84a942f-02fa-4016-bb22-5f594c65cdd1.jpg?v=1766180936',
                            'Premium Dog Food - Chicken & Rice': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop&auto=format', // Dog food bag
                            'Organic Cat Treats - Salmon': 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=500&h=400&fit=crop&auto=format', // Cat treats
                            'Interactive Puzzle Toy': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=400&fit=crop&auto=format', // Dog puzzle toy
                            'Feather Wand Cat Toy': 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&h=400&fit=crop&auto=format', // Cat toy
                            'Rope Chew Toy': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=400&fit=crop&auto=format', // Rope toy
                            'Orthopedic Dog Bed': 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=400&fit=crop&auto=format', // Dog bed
                            'Cat Tree Tower': 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&h=400&fit=crop&auto=format', // Cat tree
                            'Professional Dog Brush': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&h=400&fit=crop&auto=format' // Grooming brush
                        };

                        // Check if this is one of the specific products
                        const specificImage = productImageMap[product.title];
                        if (specificImage) {
                            return `${specificImage}&t=${Date.now()}`;
                        }

                        // Category-based product images
                        const categoryImages = {
                            'FOOD': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop&auto=format', // Dog food bag
                            'TOYS': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=400&fit=crop&auto=format', // Dog toys
                            'HEALTH': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=400&fit=crop&auto=format', // Vitamins/pills
                            'GROOMING': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&h=400&fit=crop&auto=format', // Grooming brush
                            'ACCESSORIES': 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500&h=400&fit=crop&auto=format', // Dog collar
                            'BEDS': 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=400&fit=crop&auto=format', // Pet bed
                            'TRAINING': 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500&h=400&fit=crop&auto=format', // Training collar
                            'TRAVEL': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop&auto=format' // Pet carrier
                        };
                        const baseUrl = categoryImages[product.category] || 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=400&fit=crop&auto=format';
                        // Add cache busting parameter
                        return `${baseUrl}&t=${Date.now()}`;
                    })()}
                    alt={product.title}
                    className="product-img"
                    key={`product-${product.id}-${product.category}-${Date.now()}`}
                />

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="pet-discount-badge">
                        <div className="discount-content">
                            <span className="discount-icon">🏷️</span>
                            <span className="discount-text">{product.discountPercentage}% OFF</span>
                        </div>
                        <div className="paw-pattern">
                            <span>🐾</span>
                            <span>🐾</span>
                        </div>
                    </div>
                )}

                {/* Stock Status */}
                <div className={`pet-stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    <span className="stock-icon">{product.inStock ? '✅' : '❌'}</span>
                    <span className="stock-text">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>

                {/* Action Buttons */}
                <div className="pet-card-actions">
                    <button
                        className={`action-btn favorite ${isLiked ? 'liked' : ''} ${isLikeAnimating ? 'animating' : ''}`}
                        onClick={handleLikeClick}
                        title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <FaHeart />
                        {isLikeAnimating && (
                            <div className="like-effect">
                                <span className="heart-burst">💖</span>
                                <span className="heart-burst">💕</span>
                                <span className="heart-burst">💗</span>
                            </div>
                        )}
                    </button>
                    <button
                        className="action-btn view"
                        onClick={() => onViewDetails(product)}
                        title="Quick View"
                    >
                        <FaEye />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="pet-product-info">
                {/* Category */}
                <div className="pet-product-category">
                    <span className="category-icon">
                        {product.category === 'FOOD' && '🍖'}
                        {product.category === 'TOYS' && '🧸'}
                        {product.category === 'HEALTH' && '💊'}
                        {product.category === 'GROOMING' && '🛁'}
                        {product.category === 'ACCESSORIES' && '🎀'}
                        {product.category === 'BEDS' && '🛏️'}
                        {product.category === 'TRAINING' && '🎯'}
                        {product.category === 'TRAVEL' && '🧳'}
                        {!['FOOD', 'TOYS', 'HEALTH', 'GROOMING', 'ACCESSORIES', 'BEDS', 'TRAINING', 'TRAVEL'].includes(product.category) && '🐾'}
                    </span>
                    <span className="category-text">{product.categoryDisplayName || product.category}</span>
                </div>

                {/* Title */}
                <h3 className="pet-product-title">{product.title}</h3>

                {/* Brand */}
                {product.brand && (
                    <p className="pet-product-brand">
                        <span className="brand-icon">🏷️</span>
                        {product.brand}
                    </p>
                )}

                {/* Vendor Information */}
                {product.vendorBusinessName && (
                    <p className="pet-product-vendor">
                        <span className="vendor-icon">🏪</span>
                        Sold by {product.vendorBusinessName}
                    </p>
                )}

                {/* Rating */}
                {rating > 0 && (
                    <div className="pet-product-rating">
                        <div className="paw-rating-container">
                            {renderPawRating(rating)}
                        </div>
                        <span className="rating-text">({rating.toFixed(1)})</span>
                    </div>
                )}

                {/* Price */}
                <div className="pet-product-price">
                    <div className="price-main">
                        <span className="current-price">₹{discountedPrice?.toFixed(2)}</span>
                        {hasDiscount && (
                            <span className="original-price">₹{product.price?.toFixed(2)}</span>
                        )}
                    </div>
                    {hasDiscount && (
                        <div className="savings-badge">
                            <span className="savings-icon">💰</span>
                            <span className="savings-text">Save ₹{(product.price - discountedPrice).toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* Stock Info */}
                <div className="pet-stock-info">
                    {product.inStock ? (
                        <span className="stock-available">
                            <span className="stock-icon">✅</span>
                            {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left!`}
                        </span>
                    ) : (
                        <span className="stock-unavailable">
                            <span className="stock-icon">❌</span>
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pet-product-actions">
                    {/* Add to Cart Button */}
                    <button
                        onClick={() => onAddToCart(product.id)}
                        disabled={!product.inStock || cartLoading}
                        className={`pet-add-to-cart ${!product.inStock ? 'disabled' : ''} ${cartLoading ? 'loading' : ''}`}
                    >
                        {cartLoading ? (
                            <>
                                <div className="loading-paws">
                                    <span>🐾</span>
                                    <span>🐾</span>
                                </div>
                                <span>Adding...</span>
                            </>
                        ) : product.inStock ? (
                            <>
                                <FaShoppingCart />
                                <span>Add to Cart</span>
                                <span className="paw-accent">🐾</span>
                            </>
                        ) : (
                            <>
                                <span className="sad-paw">🐾</span>
                                <span>Out of Stock</span>
                            </>
                        )}
                    </button>

                    {/* Buy Now Button */}
                    {product.inStock && (
                        <button
                            onClick={() => onBuyNow && onBuyNow(product)}
                            disabled={cartLoading}
                            className={`pet-buy-now ${cartLoading ? 'loading' : ''}`}
                        >
                            <span className="lightning-icon">⚡</span>
                            <span>Buy Now</span>
                            <span className="paw-accent">🐾</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="pet-card-decoration">
                <span className="deco-paw top-left">🐾</span>
                <span className="deco-paw bottom-right">🐾</span>
            </div>
        </div>
    );
};

export default ProductCard;