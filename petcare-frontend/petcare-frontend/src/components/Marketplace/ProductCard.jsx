import React, { useState } from 'react';
import { FaStar, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getCategoryEmoji = (category) => {
    const emojis = {
      'FOOD': '🍖',
      'TOYS': '🎾',
      'MEDICINE': '💊',
      'ACCESSORIES': '🎀',
      'GROOMING': '🧴',
      'HEALTHCARE': '🏥',
      'TRAINING': '📚',
      'OTHER': '📦'
    };
    return emojis[category] || '📦';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl || '/api/placeholder/300/200'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700">
          {getCategoryEmoji(product.category)} {product.category}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
          }`}
        >
          <FaHeart size={16} />
        </button>

        {/* Stock Status */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
            Only {product.stockQuantity} left!
          </div>
        )}

        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover Actions */}
        {isHovered && product.stockQuantity > 0 && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="flex gap-2">
              <button className="p-3 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors">
                <FaEye size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
              >
                <FaShoppingCart size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-600">
            ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Price and Vendor */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ${product.price}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Sold by</p>
            <p className="text-sm font-semibold text-gray-700">{product.vendorName}</p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stockQuantity === 0}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            product.stockQuantity === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          <FaShoppingCart size={16} />
          {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;