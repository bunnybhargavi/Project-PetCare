import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaImage, FaSave } from 'react-icons/fa';
import { productService } from '../../services/productService';

const AdminPanel = ({ onClose, onProductUpdate }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: 'FOOD',
        brand: '',
        sku: '',
        discountPercentage: 0
    });
    const [imageFiles, setImageFiles] = useState([]);

    const categories = [
        { value: 'FOOD', label: 'Food & Treats' },
        { value: 'TOYS', label: 'Toys & Entertainment' },
        { value: 'HEALTH', label: 'Health & Wellness' },
        { value: 'GROOMING', label: 'Grooming & Care' },
        { value: 'ACCESSORIES', label: 'Accessories' },
        { value: 'BEDS', label: 'Beds & Furniture' },
        { value: 'TRAINING', label: 'Training & Behavior' },
        { value: 'TRAVEL', label: 'Travel & Carriers' }
    ];

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAllProducts(0, 100);
            setProducts(response.content || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            stock: '',
            category: 'FOOD',
            brand: '',
            sku: '',
            discountPercentage: 0
        });
        setImageFiles([]);
        setEditingProduct(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                discountPercentage: parseFloat(formData.discountPercentage) || 0,
                active: true
            };

            let savedProduct;
            if (editingProduct) {
                savedProduct = await productService.updateProduct(editingProduct.id, productData);
            } else {
                savedProduct = await productService.createProduct(productData);
            }

            // Upload images if any
            if (imageFiles.length > 0 && savedProduct.id) {
                for (const file of imageFiles) {
                    try {
                        await productService.uploadProductImage(savedProduct.id, file);
                    } catch (error) {
                        console.error('Failed to upload image:', error);
                    }
                }
            }

            alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
            resetForm();
            loadProducts();
            onProductUpdate();
            setActiveTab('list');
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            stock: product.stock?.toString() || '',
            category: product.category || 'FOOD',
            brand: product.brand || '',
            sku: product.sku || '',
            discountPercentage: product.discountPercentage || 0
        });
        setActiveTab('form');
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                setLoading(true);
                await productService.deleteProduct(productId);
                alert('Product deleted successfully!');
                loadProducts();
                onProductUpdate();
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="admin-panel-overlay">
            <div className="admin-panel">
                <div className="admin-header">
                    <h2>🛠️ Admin Panel - Product Management</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        📋 Product List
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('form');
                            resetForm();
                        }}
                    >
                        <FaPlus /> Add Product
                    </button>
                </div>

                <div className="admin-content">
                    {activeTab === 'list' && (
                        <div className="products-list">
                            <div className="list-header">
                                <h3>Products ({products.length})</h3>
                                <button 
                                    className="add-btn"
                                    onClick={() => {
                                        setActiveTab('form');
                                        resetForm();
                                    }}
                                >
                                    <FaPlus /> Add New Product
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading">Loading products...</div>
                            ) : (
                                <div className="products-table">
                                    {products.map(product => (
                                        <div key={product.id} className="product-row">
                                            <div className="product-image">
                                                {product.images && product.images.length > 0 ? (
                                                    <img 
                                                        src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:8080${product.images[0]}`}
                                                        alt={product.title}
                                                    />
                                                ) : (
                                                    <div className="no-image">📦</div>
                                                )}
                                            </div>
                                            <div className="product-details">
                                                <h4>{product.title}</h4>
                                                <p className="product-category">{product.categoryDisplayName}</p>
                                                <p className="product-price">₹{product.price?.toFixed(2)}</p>
                                                <p className="product-stock">Stock: {product.stock}</p>
                                            </div>
                                            <div className="product-actions">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'form' && (
                        <div className="product-form">
                            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Product Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter product title"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            placeholder="Enter brand name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>SKU</label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                            placeholder="Product SKU"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Price *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Stock Quantity *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Discount Percentage</label>
                                        <input
                                            type="number"
                                            name="discountPercentage"
                                            value={formData.discountPercentage}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            rows="4"
                                            placeholder="Enter product description"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Product Images</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="file-input"
                                        />
                                        <div className="file-info">
                                            <FaImage /> You can select multiple images
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => {
                                            resetForm();
                                            setActiveTab('list');
                                        }}
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="save-btn"
                                        disabled={loading}
                                    >
                                        <FaSave /> {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;