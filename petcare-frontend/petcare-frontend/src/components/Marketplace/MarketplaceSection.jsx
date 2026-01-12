import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaFilter, FaShoppingCart, FaHeart, FaStar, FaPlus, FaMinus, FaTimes, FaTh, FaList, FaSort, FaMapMarkerAlt, FaTag, FaClock } from 'react-icons/fa';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import CartModal from './CartModal';
import CheckoutModal from './CheckoutModal';
import './Marketplace.css';

const MarketplaceSection = ({ styles }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [quickFilters, setQuickFilters] = useState({
        onSale: false,
        inStock: true,
        highRated: false,
        newArrivals: false
    });
    
    // Modals
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    
    // Cart
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        loadCategories();
        loadAllProducts();
        loadCart();
    }, []);

    // Real-time filtering and search
    useEffect(() => {
        filterAndSortProducts();
    }, [products, searchTerm, selectedCategory, priceRange, sortBy, sortDir, quickFilters]);

    const loadCategories = async () => {
        try {
            const data = await productService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadAllProducts = async () => {
        try {
            setLoading(true);
            // Load all products at once for dynamic filtering
            const response = await productService.getAllProducts(0, 100, 'createdAt', 'desc');
            setProducts(response.content || []);
        } catch (error) {
            console.error('Failed to load products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Dynamic filtering function
    const filterAndSortProducts = useCallback(() => {
        let filtered = [...products];

        // Search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search) ||
                product.brand?.toLowerCase().includes(search) ||
                product.categoryDisplayName.toLowerCase().includes(search)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Price range filter
        filtered = filtered.filter(product => {
            const price = product.discountedPrice || product.price;
            return price >= priceRange.min && price <= priceRange.max;
        });

        // Quick filters
        if (quickFilters.onSale) {
            filtered = filtered.filter(product => product.discountPercentage > 0);
        }
        if (quickFilters.inStock) {
            filtered = filtered.filter(product => product.inStock);
        }
        if (quickFilters.highRated) {
            filtered = filtered.filter(product => product.rating >= 4.5);
        }
        if (quickFilters.newArrivals) {
            // Assuming newer products have higher IDs
            const sortedByDate = [...products].sort((a, b) => b.id - a.id);
            const newProductIds = sortedByDate.slice(0, 6).map(p => p.id);
            filtered = filtered.filter(product => newProductIds.includes(product.id));
        }

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'price':
                    aValue = a.discountedPrice || a.price;
                    bValue = b.discountedPrice || b.price;
                    break;
                case 'rating':
                    aValue = a.rating || 0;
                    bValue = b.rating || 0;
                    break;
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'discount':
                    aValue = a.discountPercentage || 0;
                    bValue = b.discountPercentage || 0;
                    break;
                default: // createdAt
                    aValue = a.id;
                    bValue = b.id;
            }

            if (sortDir === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredProducts(filtered);
        setTotalPages(Math.ceil(filtered.length / 12));
        setCurrentPage(0);
    }, [products, searchTerm, selectedCategory, priceRange, sortBy, sortDir, quickFilters]);

    // Paginated products
    const paginatedProducts = useMemo(() => {
        const startIndex = currentPage * 12;
        return filteredProducts.slice(startIndex, startIndex + 12);
    }, [filteredProducts, currentPage]);

    // Dynamic stats calculation
    const stats = useMemo(() => {
        const totalProducts = filteredProducts.length;
        const onSaleCount = filteredProducts.filter(p => p.discountPercentage > 0).length;
        const avgRating = totalProducts > 0 
            ? (filteredProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProducts).toFixed(1)
            : '0.0';
        const minPrice = totalProducts > 0 
            ? Math.min(...filteredProducts.map(p => p.discountedPrice || p.price)).toFixed(2)
            : '0.00';
        const maxPrice = totalProducts > 0 
            ? Math.max(...filteredProducts.map(p => p.discountedPrice || p.price)).toFixed(2)
            : '0.00';
        const inStockCount = filteredProducts.filter(p => p.inStock).length;

        return {
            totalProducts,
            onSaleCount,
            avgRating,
            priceRange: `$${minPrice} - $${maxPrice}`,
            inStockCount,
            categories: categories.length
        };
    }, [filteredProducts, categories]);

    const loadCart = async () => {
        try {
            const response = await cartService.getCart();
            setCart(response.data);
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    };

    const handleAddToCart = async (productId, quantity = 1) => {
        try {
            setCartLoading(true);
            await cartService.addToCart(productId, quantity);
            await loadCart();
            // Show success message
            alert('Product added to cart!');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add product to cart: ' + (error.response?.data?.message || error.message));
        } finally {
            setCartLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handlePriceRangeChange = (min, max) => {
        setPriceRange({ min, max });
    };

    const handleSortChange = (newSortBy, newSortDir) => {
        setSortBy(newSortBy);
        setSortDir(newSortDir);
    };

    const handleQuickFilterChange = (filterName) => {
        setQuickFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setPriceRange({ min: 0, max: 200 });
        setQuickFilters({
            onSale: false,
            inStock: true,
            highRated: false,
            newArrivals: false
        });
    };

    const getCategoryDisplayName = (category) => {
        const categoryMap = {
            'FOOD': 'Food & Treats',
            'TOYS': 'Toys & Entertainment',
            'HEALTH': 'Health & Wellness',
            'GROOMING': 'Grooming & Care',
            'ACCESSORIES': 'Accessories',
            'BEDS': 'Beds & Furniture',
            'TRAINING': 'Training & Behavior',
            'TRAVEL': 'Travel & Carriers'
        };
        return categoryMap[category] || category;
    };

    return (
        <div className="marketplace-section">
            {/* Dynamic Header with Live Stats */}
            <div className="marketplace-header">
                <div className="header-content">
                    <div className="title-section">
                        <h2 className="section-title">🛒 Pet Marketplace</h2>
                        <p className="section-subtitle">Everything your furry friends need, delivered to your door</p>
                    </div>
                    
                    {/* Live Statistics Dashboard */}
                    {!loading && (
                        <div className="live-stats-dashboard">
                            <div className="stats-grid">
                                <div className="stat-card primary">
                                    <div className="stat-icon">📦</div>
                                    <div className="stat-content">
                                        <span className="stat-number">{stats.totalProducts}</span>
                                        <span className="stat-label">Products Found</span>
                                    </div>
                                </div>
                                <div className="stat-card success">
                                    <div className="stat-icon">🏷️</div>
                                    <div className="stat-content">
                                        <span className="stat-number">{stats.onSaleCount}</span>
                                        <span className="stat-label">On Sale</span>
                                    </div>
                                </div>
                                <div className="stat-card warning">
                                    <div className="stat-icon">⭐</div>
                                    <div className="stat-content">
                                        <span className="stat-number">{stats.avgRating}</span>
                                        <span className="stat-label">Avg Rating</span>
                                    </div>
                                </div>
                                <div className="stat-card info">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-content">
                                        <span className="stat-number">{stats.priceRange}</span>
                                        <span className="stat-label">Price Range</span>
                                    </div>
                                </div>
                                <div className="stat-card accent">
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-content">
                                        <span className="stat-number">{stats.inStockCount}</span>
                                        <span className="stat-label">In Stock</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="header-actions">
                    <button 
                        className="cart-button"
                        onClick={() => setShowCart(true)}
                    >
                        <FaShoppingCart />
                        <span>Cart</span>
                        {cart && cart.totalItems > 0 && (
                            <span className="cart-badge">{cart.totalItems}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Dynamic Search and Controls */}
            <div className="dynamic-controls">
                <div className="search-section">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products, brands, categories..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="dynamic-search-input"
                        />
                        {searchTerm && (
                            <button 
                                className="clear-search"
                                onClick={() => setSearchTerm('')}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="quick-filters">
                    <button 
                        className={`quick-filter ${quickFilters.onSale ? 'active' : ''}`}
                        onClick={() => handleQuickFilterChange('onSale')}
                    >
                        <FaTag /> On Sale
                    </button>
                    <button 
                        className={`quick-filter ${quickFilters.highRated ? 'active' : ''}`}
                        onClick={() => handleQuickFilterChange('highRated')}
                    >
                        <FaStar /> 4.5+ Stars
                    </button>
                    <button 
                        className={`quick-filter ${quickFilters.newArrivals ? 'active' : ''}`}
                        onClick={() => handleQuickFilterChange('newArrivals')}
                    >
                        <FaClock /> New Arrivals
                    </button>
                    <button 
                        className={`quick-filter ${quickFilters.inStock ? 'active' : ''}`}
                        onClick={() => handleQuickFilterChange('inStock')}
                    >
                        <FaMapMarkerAlt /> In Stock
                    </button>
                </div>

                {/* View Controls */}
                <div className="view-controls">
                    <div className="view-mode-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <FaTh />
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <FaList />
                        </button>
                    </div>

                    <button 
                        className={`filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> Advanced Filters
                    </button>

                    <select 
                        value={sortBy + '-' + sortDir}
                        onChange={(e) => {
                            const [newSortBy, newSortDir] = e.target.value.split('-');
                            handleSortChange(newSortBy, newSortDir);
                        }}
                        className="sort-select"
                    >
                        <option value="createdAt-desc">🆕 Newest First</option>
                        <option value="createdAt-asc">🕐 Oldest First</option>
                        <option value="price-asc">💰 Price: Low to High</option>
                        <option value="price-desc">💰 Price: High to Low</option>
                        <option value="rating-desc">⭐ Highest Rated</option>
                        <option value="discount-desc">🏷️ Best Deals</option>
                        <option value="title-asc">🔤 Name: A to Z</option>
                    </select>

                    {(searchTerm || selectedCategory !== 'all' || quickFilters.onSale || quickFilters.highRated || quickFilters.newArrivals || !quickFilters.inStock) && (
                        <button 
                            className="clear-filters"
                            onClick={clearAllFilters}
                        >
                            <FaTimes /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="advanced-filters-panel">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <h4>📂 Categories</h4>
                            <div className="category-grid">
                                <button 
                                    className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange('all')}
                                >
                                    All Categories
                                </button>
                                {categories.map(category => (
                                    <button 
                                        key={category}
                                        className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                                        onClick={() => handleCategoryChange(category)}
                                    >
                                        {getCategoryDisplayName(category)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h4>💰 Price Range</h4>
                            <div className="price-range-container">
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => handlePriceRangeChange(parseInt(e.target.value) || 0, priceRange.max)}
                                        className="price-input"
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => handlePriceRangeChange(priceRange.min, parseInt(e.target.value) || 200)}
                                        className="price-input"
                                    />
                                </div>
                                <div className="price-sliders">
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={priceRange.min}
                                        onChange={(e) => handlePriceRangeChange(parseInt(e.target.value), priceRange.max)}
                                        className="price-slider min-slider"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={priceRange.max}
                                        onChange={(e) => handlePriceRangeChange(priceRange.min, parseInt(e.target.value))}
                                        className="price-slider max-slider"
                                    />
                                </div>
                                <div className="price-display">
                                    ${priceRange.min} - ${priceRange.max}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Results Section */}
            <div className="results-section">
                {loading ? (
                    <div className={`loading-grid ${viewMode}`}>
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="product-skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-price"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : paginatedProducts.length === 0 ? (
                    <div className="empty-results">
                        <div className="empty-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters</p>
                        <button className="reset-filters" onClick={clearAllFilters}>
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="results-header">
                            <div className="results-info">
                                <span className="results-count">
                                    Showing {currentPage * 12 + 1}-{Math.min((currentPage + 1) * 12, filteredProducts.length)} of {filteredProducts.length} products
                                </span>
                                {searchTerm && (
                                    <span className="search-info">
                                        for "{searchTerm}"
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={`products-container ${viewMode}`}>
                            {paginatedProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onViewDetails={setSelectedProduct}
                                    cartLoading={cartLoading}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>

                        {/* Dynamic Pagination */}
                        {totalPages > 1 && (
                            <div className="dynamic-pagination">
                                <button 
                                    disabled={currentPage === 0}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>
                                
                                <div className="pagination-pages">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button 
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    className="pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={handleAddToCart}
                    cartLoading={cartLoading}
                />
            )}

            {showCart && (
                <CartModal
                    cart={cart}
                    onClose={() => setShowCart(false)}
                    onUpdateCart={loadCart}
                    onCheckout={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                    }}
                />
            )}

            {showCheckout && (
                <CheckoutModal
                    cart={cart}
                    onClose={() => setShowCheckout(false)}
                    onOrderComplete={() => {
                        setShowCheckout(false);
                        loadCart();
                    }}
                />
            )}
        </div>
    );
};

export default MarketplaceSection;