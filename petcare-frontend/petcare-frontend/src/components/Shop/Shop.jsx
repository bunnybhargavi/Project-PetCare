import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaFilter, FaShoppingCart, FaHeart, FaPlus, FaMinus, FaTimes, FaTh, FaList, FaSort, FaMapMarkerAlt, FaTag, FaClock, FaUser, FaCog, FaDog, FaCat, FaBone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import CartModal from './CartModal';
import CheckoutModal from './CheckoutModal';
import AdminPanel from './AdminPanel';
import './Shop.css';

const Shop = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [quickFilters, setQuickFilters] = useState({
        onSale: false,
        inStock: false,
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

    // Liked Products
    const [likedProducts, setLikedProducts] = useState(() => {
        const saved = localStorage.getItem('petcare-liked-products');
        return saved ? JSON.parse(saved) : [];
    });

    // Load initial data
    useEffect(() => {
        loadCategories();
        loadAllProducts();
        loadCart();
    }, []);

    // Save liked products to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('petcare-liked-products', JSON.stringify(likedProducts));
    }, [likedProducts]);

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
            const response = await productService.getAllProducts(0, 100, 'createdAt', 'desc');
            // Keep only the first product
            const allProducts = response.content || [];
            setProducts(allProducts);
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
                default:
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
            priceRange: `₹${minPrice} - ₹${maxPrice}`,
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
            alert('Product added to cart!');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add product to cart: ' + (error.response?.data?.message || error.message));
        } finally {
            setCartLoading(false);
        }
    };

    const handleBuyNow = async (product, quantity = 1) => {
        try {
            setCartLoading(true);
            // Add to cart first
            await cartService.addToCart(product.id, quantity);
            await loadCart();
            // Then immediately open checkout
            setShowCheckout(true);
        } catch (error) {
            console.error('Failed to buy now:', error);
            alert('Failed to process purchase: ' + (error.response?.data?.message || error.message));
        } finally {
            setCartLoading(false);
        }
    };

    const handleToggleLike = (productId) => {
        setLikedProducts(prev => {
            if (prev.includes(productId)) {
                // Remove from liked products
                return prev.filter(id => id !== productId);
            } else {
                // Add to liked products
                return [...prev, productId];
            }
        });
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
        setPriceRange({ min: 0, max: 10000 });
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

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="pet-shop-container">
            {/* Header */}
            <div className="pet-shop-header">
                <div className="header-content">
                    <div className="title-section">
                        <h1 className="pet-shop-title">
                            <span className="paw-icon">🐾</span>
                            Pet Paradise Shop
                            <span className="paw-icon">🐾</span>
                        </h1>
                        <p className="pet-shop-subtitle">Everything your furry friends need, with love! 💕</p>
                    </div>

                    <div className="header-actions">
                        {isAdmin && (
                            <button
                                className="admin-button pet-themed"
                                onClick={() => setShowAdminPanel(true)}
                            >
                                <FaCog />
                                <span>Admin Panel</span>
                            </button>
                        )}
                        <button
                            className="cart-button pet-themed"
                            onClick={() => setShowCart(true)}
                        >
                            <FaShoppingCart />
                            <span>My Cart</span>
                            {cart && cart.totalItems > 0 && (
                                <span className="cart-badge paw-badge">{cart.totalItems}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pet-shop-main">
                {/* Left Sidebar with Filters */}
                <div className="pet-filters-sidebar">
                    <div className="sidebar-header">
                        <h3 className="filter-title">
                            <span className="bone-icon">🦴</span>
                            Filter & Find
                        </h3>
                    </div>

                    {/* Search Section */}
                    <div className="filter-section">
                        <div className="section-divider">
                            <span className="paw-divider">🐾</span>
                        </div>
                        <h4 className="section-title">Search Products</h4>
                        <div className="pet-search-container">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for treats, toys..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pet-search-input"
                            />
                            {searchTerm && (
                                <button
                                    className="clear-search pet-button"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="filter-section">
                        <div className="section-divider">
                            <span className="bone-divider">🦴</span>
                        </div>
                        <h4 className="section-title">Pet Categories</h4>
                        <div className="category-buttons">
                            <button
                                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('all')}
                            >
                                <span className="category-icon">🌟</span>
                                All Products
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'FOOD' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('FOOD')}
                            >
                                <span className="category-icon">🍖</span>
                                Food & Treats
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'TOYS' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('TOYS')}
                            >
                                <span className="category-icon">🧸</span>
                                Toys & Fun
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'HEALTH' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('HEALTH')}
                            >
                                <span className="category-icon">💊</span>
                                Health Care
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'GROOMING' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('GROOMING')}
                            >
                                <span className="category-icon">🛁</span>
                                Grooming
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'ACCESSORIES' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('ACCESSORIES')}
                            >
                                <span className="category-icon">🎀</span>
                                Accessories
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'BEDS' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('BEDS')}
                            >
                                <span className="category-icon">🛏️</span>
                                Beds & Comfort
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'TRAINING' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('TRAINING')}
                            >
                                <span className="category-icon">🎯</span>
                                Training
                            </button>
                            <button
                                className={`category-btn ${selectedCategory === 'TRAVEL' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('TRAVEL')}
                            >
                                <span className="category-icon">🧳</span>
                                Travel Gear
                            </button>
                        </div>
                    </div>

                    {/* Price Range Section */}
                    <div className="filter-section">
                        <div className="section-divider">
                            <span className="paw-divider">🐾</span>
                        </div>
                        <h4 className="section-title">Price Range</h4>
                        <div className="pet-price-range">
                            <div className="price-display">
                                <span className="price-tag">💰 ₹{priceRange.min} - ₹{priceRange.max}</span>
                            </div>
                            <div className="price-sliders">
                                <div
                                    className="price-range-fill"
                                    style={{
                                        left: `${(priceRange.min / 10000) * 100}%`,
                                        width: `${((priceRange.max - priceRange.min) / 10000) * 100}%`
                                    }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    value={priceRange.min}
                                    onChange={(e) => handlePriceRangeChange(parseInt(e.target.value), priceRange.max)}
                                    className="pet-price-slider min-slider"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    value={priceRange.max}
                                    onChange={(e) => handlePriceRangeChange(priceRange.min, parseInt(e.target.value))}
                                    className="pet-price-slider max-slider"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="filter-section">
                        <div className="section-divider">
                            <span className="bone-divider">🦴</span>
                        </div>
                        <h4 className="section-title">Quick Filters</h4>
                        <div className="quick-filter-pills">
                            <button
                                className={`filter-pill ${quickFilters.onSale ? 'active sale' : ''}`}
                                onClick={() => handleQuickFilterChange('onSale')}
                            >
                                <span className="pill-icon">🏷️</span>
                                On Sale
                            </button>
                            <button
                                className={`filter-pill ${quickFilters.highRated ? 'active rating' : ''}`}
                                onClick={() => handleQuickFilterChange('highRated')}
                            >
                                <span className="pill-icon">⭐</span>
                                Top Rated
                            </button>
                            <button
                                className={`filter-pill ${quickFilters.newArrivals ? 'active new' : ''}`}
                                onClick={() => handleQuickFilterChange('newArrivals')}
                            >
                                <span className="pill-icon">✨</span>
                                New Arrivals
                            </button>
                            <button
                                className={`filter-pill ${quickFilters.inStock ? 'active stock' : ''}`}
                                onClick={() => handleQuickFilterChange('inStock')}
                            >
                                <span className="pill-icon">✅</span>
                                In Stock
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="filter-section">
                        <div className="section-divider">
                            <span className="paw-divider">🐾</span>
                        </div>
                        <button
                            className={`advanced-filters-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <span className="paw-icon">🐾</span>
                            Advanced Filters
                            <FaFilter />
                        </button>

                        {/* Advanced Filters Content */}
                        {showFilters && (
                            <div className="advanced-filters-content">
                                <div className="advanced-filter-group">
                                    <h5 className="filter-group-title">🏷️ Brand Filters</h5>
                                    <div className="brand-filters">
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>PawHaven Pro</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>FelinePlay</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>CanineComfort</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>HealthyPaws</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="advanced-filter-group">
                                    <h5 className="filter-group-title">⭐ Rating Filters</h5>
                                    <div className="rating-filters">
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🐾🐾🐾🐾🐾 5 Paws</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🐾🐾🐾🐾 4+ Paws</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🐾🐾🐾 3+ Paws</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="advanced-filter-group">
                                    <h5 className="filter-group-title">📦 Availability</h5>
                                    <div className="availability-filters">
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>✅ In Stock Only</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🚚 Free Shipping</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>⚡ Same Day Delivery</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="advanced-filter-group">
                                    <h5 className="filter-group-title">🎯 Pet Size</h5>
                                    <div className="size-filters">
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🐕 Small Pets</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🐕‍🦺 Medium Pets</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🐕‍🦺 Large Pets</span>
                                        </label>
                                        <label className="filter-checkbox">
                                            <input type="checkbox" />
                                            <span>🐱 All Cats</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="advanced-actions">
                                    <button className="apply-filters-btn">
                                        <span>🐾</span>
                                        Apply Filters
                                    </button>
                                    <button className="reset-advanced-btn">
                                        <span>🔄</span>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Clear All Filters */}
                    {(searchTerm || selectedCategory !== 'all' || quickFilters.onSale || quickFilters.highRated || quickFilters.newArrivals || !quickFilters.inStock) && (
                        <div className="filter-section">
                            <button
                                className="clear-all-filters"
                                onClick={clearAllFilters}
                            >
                                <FaTimes />
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="pet-shop-content">
                    {/* Top Controls */}
                    <div className="content-header">
                        <div className="content-controls">
                            <div className="view-toggle pet-themed">
                                <button
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >
                                    <FaTh />
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    <FaList />
                                </button>
                            </div>

                            <select
                                value={sortBy + '-' + sortDir}
                                onChange={(e) => {
                                    const [newSortBy, newSortDir] = e.target.value.split('-');
                                    handleSortChange(newSortBy, newSortDir);
                                }}
                                className="pet-sort-select"
                            >
                                <option value="createdAt-desc">🆕 Newest Arrivals</option>
                                <option value="createdAt-asc">🕐 Oldest First</option>
                                <option value="price-asc">💰 Price: Low to High</option>
                                <option value="price-desc">💰 Price: High to Low</option>
                                <option value="rating-desc">⭐ Highest Rated</option>
                                <option value="discount-desc">🏷️ Best Deals</option>
                                <option value="title-asc">🔤 Name: A to Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="pet-products-section">
                        {loading ? (
                            <div className="pet-loading">
                                <div className="loading-animation">
                                    <div className="bouncing-paws">
                                        <span className="paw">🐾</span>
                                        <span className="paw">🐾</span>
                                        <span className="paw">🐾</span>
                                    </div>
                                    <p>Finding pawsome products...</p>
                                </div>
                            </div>
                        ) : paginatedProducts.length === 0 ? (
                            <div className="pet-empty-state">
                                <div className="empty-animation">
                                    <span className="sad-pet">🐕‍🦺</span>
                                    <div className="empty-paws">
                                        <span>🐾</span>
                                        <span>🐾</span>
                                        <span>🐾</span>
                                    </div>
                                </div>
                                <h3>No products found</h3>
                                <p>Try adjusting your search or filters to find what you're looking for!</p>
                                <button className="reset-filters-btn" onClick={clearAllFilters}>
                                    <span className="btn-icon">🔄</span>
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`pet-products-grid ${viewMode}`}>
                                    {paginatedProducts.map(product => (
                                        <ProductCard
                                            key={`product-${product.id}-${product.category}-${Date.now()}`}
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                            onViewDetails={setSelectedProduct}
                                            onToggleLike={handleToggleLike}
                                            likedProducts={likedProducts}
                                            cartLoading={cartLoading}
                                            viewMode={viewMode}
                                            onBuyNow={handleBuyNow}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pet-pagination">
                                        <button
                                            disabled={currentPage === 0}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            className="pagination-btn prev"
                                        >
                                            <span className="paw-icon">🐾</span>
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
                                            className="pagination-btn next"
                                        >
                                            Next
                                            <span className="paw-icon">🐾</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={handleAddToCart}
                    cartLoading={cartLoading}
                    onBuyNow={handleBuyNow}
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
                    onCartUpdate={loadCart}
                />
            )}

            {showAdminPanel && isAdmin && (
                <AdminPanel
                    onClose={() => setShowAdminPanel(false)}
                    onProductUpdate={loadAllProducts}
                />
            )}
        </div>
    );
};

export default Shop;