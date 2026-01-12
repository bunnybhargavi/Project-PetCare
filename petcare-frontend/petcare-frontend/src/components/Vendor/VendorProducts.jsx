import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/vendorService';

const VendorProducts = ({ vendor }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        images: [],
        active: true,
        discountPercentage: 0
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await vendorService.getVendorProducts(vendor.id);
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (vendor?.id) {
            fetchProducts();
        }
    }, [vendor]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = (files) => {
        const validFiles = Array.from(files).filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
            
            if (!isValidType) {
                showNotification('❌ Please select only image files', 'error');
                return false;
            }
            if (!isValidSize) {
                showNotification('❌ Image size should be less than 5MB', 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Limit to 5 images total
        const currentCount = imageFiles.length;
        const newFiles = validFiles.slice(0, 5 - currentCount);
        
        if (newFiles.length < validFiles.length) {
            showNotification('⚠️ Maximum 5 images allowed', 'error');
        }

        setImageFiles(prev => [...prev, ...newFiles]);

        // Create previews
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, {
                    file: file,
                    url: e.target.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileInputChange = (e) => {
        handleImageUpload(e.target.files);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files);
        }
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const convertImagesToBase64 = async (files) => {
        const promises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });
        return Promise.all(promises);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            
            // Upload images first if any
            let imageUrls = [];
            if (imageFiles.length > 0) {
                try {
                    const formData = new FormData();
                    imageFiles.forEach(file => {
                        formData.append('files', file);
                    });

                    const uploadResponse = await fetch('http://localhost:8080/api/images/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const uploadResult = await uploadResponse.json();
                    if (uploadResult.success) {
                        imageUrls = uploadResult.imageUrls;
                        showNotification('✅ Images uploaded successfully!', 'success');
                    } else {
                        throw new Error(uploadResult.message || 'Failed to upload images');
                    }
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError);
                    showNotification('⚠️ Failed to upload images, but product will be created without images', 'error');
                    // Continue with product creation even if image upload fails
                }
            }
            
            // Convert string values to appropriate types
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                discountPercentage: parseFloat(formData.discountPercentage) || 0,
                images: imageUrls // Use uploaded image URLs
            };

            const response = await vendorService.createVendorProduct(vendor.id, productData);
            if (response.success) {
                // Refresh products list
                const updatedResponse = await vendorService.getVendorProducts(vendor.id);
                if (updatedResponse.success) {
                    setProducts(updatedResponse.data);
                }
                
                // Reset form and close modal
                resetForm();
                setShowAddForm(false);
                
                // Show success notification
                showNotification('✅ Product created successfully with images!', 'success');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification('❌ Failed to create product: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                console.log('Deleting product:', productId);
                const response = await vendorService.deleteVendorProduct(vendor.id, productId);
                console.log('Delete response:', response);
                
                if (response.success) {
                    // Refresh products list
                    const updatedResponse = await vendorService.getVendorProducts(vendor.id);
                    if (updatedResponse.success) {
                        setProducts(updatedResponse.data);
                    }
                    showNotification('✅ Product deleted successfully!', 'success');
                } else {
                    throw new Error(response.message || 'Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('❌ Failed to delete product: ' + (error.message || 'Unknown error'), 'error');
            }
        }
    };

    const handleEditProduct = (product) => {
        console.log('Editing product:', product);
        setEditingProduct(product);
        setFormData({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            stock: product.stock?.toString() || '',
            category: product.category || '',
            brand: product.brand || '',
            images: product.images || [],
            active: product.active !== undefined ? product.active : true,
            discountPercentage: product.discountPercentage?.toString() || '0'
        });
        // Clear new image uploads when editing
        setImageFiles([]);
        setImagePreviews([]);
        setShowEditForm(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            console.log('Updating product:', editingProduct.id, 'with data:', formData);
            
            // Upload new images if any
            let imageUrls = [...(formData.images || [])]; // Keep existing images
            if (imageFiles.length > 0) {
                try {
                    const formDataUpload = new FormData();
                    imageFiles.forEach(file => {
                        formDataUpload.append('files', file);
                    });

                    console.log('Uploading new images...');
                    const uploadResponse = await fetch('http://localhost:8080/api/images/upload', {
                        method: 'POST',
                        body: formDataUpload
                    });

                    const uploadResult = await uploadResponse.json();
                    if (uploadResult.success) {
                        imageUrls = [...imageUrls, ...uploadResult.imageUrls]; // Add new images
                        console.log('New images uploaded successfully:', uploadResult.imageUrls);
                        showNotification('✅ New images uploaded successfully!', 'success');
                    } else {
                        throw new Error(uploadResult.message || 'Failed to upload images');
                    }
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError);
                    showNotification('⚠️ Failed to upload new images, but product will be updated', 'error');
                }
            }
            
            // Convert string values to appropriate types
            const productData = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                discountPercentage: parseFloat(formData.discountPercentage) || 0,
                images: imageUrls
            };

            console.log('Sending update request with data:', productData);
            const response = await vendorService.updateVendorProduct(vendor.id, editingProduct.id, productData);
            console.log('Update response:', response);
            
            if (response.success) {
                // Refresh products list
                const updatedResponse = await vendorService.getVendorProducts(vendor.id);
                if (updatedResponse.success) {
                    setProducts(updatedResponse.data);
                }
                
                // Reset form and close modal
                resetForm();
                setShowEditForm(false);
                setEditingProduct(null);
                
                showNotification('✅ Product updated successfully!', 'success');
            } else {
                throw new Error(response.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('❌ Failed to update product: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            brand: '',
            images: [],
            active: true,
            discountPercentage: 0
        });
        setImageFiles([]);
        setImagePreviews([]);
    };

    const showNotification = (message, type) => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'};
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
            z-index: 1000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64" style={{backgroundColor: '#FAFAF9'}}>
                <div className="text-center">
                    <div 
                        className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
                        style={{borderColor: '#7C3F8C'}}
                    ></div>
                    <p className="text-lg font-medium" style={{color: '#7C3F8C'}}>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8" style={{backgroundColor: '#FAFAF9', minHeight: '100vh'}}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2" style={{color: '#7C3F8C'}}>
                        📦 Products
                    </h2>
                    <p className="text-gray-600 text-lg">Manage your product inventory</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-8 py-4 rounded-3xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center space-x-3"
                    style={{
                        background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)',
                        boxShadow: '0 8px 32px rgba(124, 63, 140, 0.3)'
                    }}
                >
                    <span className="text-xl">🐾</span>
                    <span>Add Product</span>
                </button>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center relative overflow-hidden">
                    {/* Paw print decoration */}
                    <div className="absolute top-8 right-8 opacity-10" style={{color: '#7C3F8C'}}>
                        <span className="text-6xl">🐾</span>
                    </div>
                    <div className="absolute bottom-8 left-8 opacity-10" style={{color: '#7C3F8C'}}>
                        <span className="text-4xl">🐾</span>
                    </div>
                    
                    <div 
                        className="text-9xl mb-6 animate-bounce"
                        style={{fontSize: '120px', lineHeight: '1'}}
                    >
                        📦
                    </div>
                    <h3 className="text-3xl font-bold mb-4" style={{color: '#7C3F8C', fontSize: '28px'}}>
                        No products yet
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                        Start building your pet store by adding your first amazing product to the inventory
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-8 py-4 rounded-3xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center space-x-3 mx-auto"
                        style={{
                            background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)',
                            boxShadow: '0 8px 32px rgba(124, 63, 140, 0.3)'
                        }}
                    >
                        <span className="text-xl">🐾</span>
                        <span>Add Your First Product</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div 
                            key={product.id} 
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:scale-102 hover:shadow-xl"
                            style={{
                                transform: 'scale(1)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 63, 140, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                            }}
                        >
                            {/* Product Image */}
                            <div className="relative" style={{aspectRatio: '4/3'}}>
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:8080${product.images[0]}`}
                                        alt={product.title}
                                        className="w-full h-full object-cover rounded-t-2xl"
                                        onError={(e) => {
                                            console.error('Failed to load image:', product.images[0]);
                                            // Fallback to placeholder if image fails to load
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                        onLoad={() => {
                                            console.log('Image loaded successfully:', product.images[0]);
                                        }}
                                    />
                                ) : null}
                                
                                {/* Fallback placeholder - always present but hidden if image loads */}
                                <div 
                                    className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center rounded-t-2xl"
                                    style={{display: (product.images && product.images.length > 0) ? 'none' : 'flex'}}
                                >
                                    <div className="text-6xl text-gray-400">📦</div>
                                </div>
                                
                                {/* Category Badge */}
                                <div className="absolute top-4 left-4">
                                    <span 
                                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                        style={{background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)'}}
                                    >
                                        {getCategoryDisplayName(product.category)}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight flex-1 mr-2">
                                        {product.title}
                                    </h3>
                                    <span 
                                        className="text-2xl font-bold flex-shrink-0"
                                        style={{color: '#7C3F8C'}}
                                    >
                                        ₹{product.price}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                    {product.description}
                                </p>
                                
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">📦</span>
                                        <span className="text-sm font-medium text-gray-700">
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        product.active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {product.active ? '✅ Active' : '❌ Inactive'}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => handleEditProduct(product)}
                                        className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 transition-all duration-200 hover:scale-105"
                                        style={{
                                            borderColor: '#7C3F8C',
                                            color: '#7C3F8C',
                                            backgroundColor: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#7C3F8C';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = '#7C3F8C';
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 transition-all duration-200 hover:scale-105"
                                        style={{
                                            borderColor: '#EF4444',
                                            color: '#EF4444',
                                            backgroundColor: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#EF4444';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = '#EF4444';
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Product Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold" style={{color: '#7C3F8C'}}>
                                    🐾 Add New Product
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setImageFiles([]);
                                        setImagePreviews([]);
                                        setFormData({
                                            title: '',
                                            description: '',
                                            price: '',
                                            stock: '',
                                            category: '',
                                            brand: '',
                                            images: [],
                                            active: true,
                                            discountPercentage: 0
                                        });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Category *
                                    </label>
                                    <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        <option value="FOOD">Food & Treats</option>
                                        <option value="TOYS">Toys & Entertainment</option>
                                        <option value="HEALTH">Health & Wellness</option>
                                        <option value="GROOMING">Grooming & Care</option>
                                        <option value="ACCESSORIES">Accessories</option>
                                        <option value="BEDS">Beds & Furniture</option>
                                        <option value="TRAINING">Training & Behavior</option>
                                        <option value="TRAVEL">Travel & Carriers</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                            style={{focusRingColor: '#7C3F8C'}}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Stock Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                            style={{focusRingColor: '#7C3F8C'}}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="Enter brand name"
                                    />
                                </div>

                                {/* Product Images Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Product Images
                                    </label>
                                    
                                    {/* Drag and Drop Area */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                            dragActive 
                                                ? 'border-purple-400 bg-purple-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileInputChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        
                                        <div className="space-y-4">
                                            <div className="text-6xl">📸</div>
                                            <div>
                                                <p className="text-lg font-medium text-gray-700">
                                                    Drop images here or click to browse
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Support: JPG, PNG, GIF (Max 5MB each, up to 5 images)
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
                                                style={{
                                                    background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)',
                                                    boxShadow: '0 4px 16px rgba(124, 63, 140, 0.3)'
                                                }}
                                            >
                                                🐾 Choose Images
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                                Selected Images ({imagePreviews.length}/5)
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                                            <img
                                                                src={preview.url}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        
                                                        {/* Remove Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                        >
                                                            ✕
                                                        </button>
                                                        
                                                        {/* Image Name */}
                                                        <p className="text-xs text-gray-500 mt-2 truncate">
                                                            {preview.name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="Enter product description"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Discount Percentage
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPercentage"
                                        value={formData.discountPercentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 rounded border-gray-300"
                                        style={{accentColor: '#7C3F8C'}}
                                    />
                                    <label className="ml-3 block text-sm font-medium text-gray-700">
                                        Product is active and available for sale
                                    </label>
                                </div>

                                <div className="flex space-x-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setImageFiles([]);
                                            setImagePreviews([]);
                                            setFormData({
                                                title: '',
                                                description: '',
                                                price: '',
                                                stock: '',
                                                category: '',
                                                brand: '',
                                                images: [],
                                                active: true,
                                                discountPercentage: 0
                                            });
                                        }}
                                        disabled={formLoading}
                                        className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-105 flex items-center justify-center space-x-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)',
                                            boxShadow: '0 8px 32px rgba(124, 63, 140, 0.3)'
                                        }}
                                    >
                                        {formLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>🐾</span>
                                                <span>Save Product</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold" style={{color: '#7C3F8C'}}>
                                    ✏️ Edit Product
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditingProduct(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <form onSubmit={handleUpdateProduct} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Category *
                                    </label>
                                    <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        <option value="FOOD">Food & Treats</option>
                                        <option value="TOYS">Toys & Entertainment</option>
                                        <option value="HEALTH">Health & Wellness</option>
                                        <option value="GROOMING">Grooming & Care</option>
                                        <option value="ACCESSORIES">Accessories</option>
                                        <option value="BEDS">Beds & Furniture</option>
                                        <option value="TRAINING">Training & Behavior</option>
                                        <option value="TRAVEL">Travel & Carriers</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                            style={{focusRingColor: '#7C3F8C'}}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Stock Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                            style={{focusRingColor: '#7C3F8C'}}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="Enter brand name"
                                    />
                                </div>

                                {/* Product Images Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Add More Images (Optional)
                                    </label>
                                    
                                    {/* Current Images */}
                                    {formData.images && formData.images.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                                Current Images ({formData.images.length})
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {formData.images.map((imageUrl, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                                            <img
                                                                src={`http://localhost:8080${imageUrl}`}
                                                                alt={`Current ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = formData.images.filter((_, i) => i !== index);
                                                                setFormData(prev => ({ ...prev, images: newImages }));
                                                            }}
                                                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Drag and Drop Area for New Images */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                            dragActive 
                                                ? 'border-purple-400 bg-purple-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileInputChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="text-6xl">📸</div>
                                        <div>
                                            <p className="text-lg font-medium text-gray-700">
                                                Drop new images here or click to browse
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Support: JPG, PNG, GIF (Max 5MB each, up to 5 images total)
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
                                            style={{
                                                background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)',
                                                boxShadow: '0 4px 16px rgba(124, 63, 140, 0.3)'
                                            }}
                                        >
                                            🐾 Choose New Images
                                        </button>
                                    </div>

                                    {/* New Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                                New Images to Add ({imagePreviews.length}/5)
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                                            <img
                                                                src={preview.url}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                        >
                                                            ✕
                                                        </button>
                                                        <p className="text-xs text-gray-500 mt-2 truncate">
                                                            {preview.name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="Enter product description"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Discount Percentage
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPercentage"
                                        value={formData.discountPercentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        style={{focusRingColor: '#7C3F8C'}}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 rounded border-gray-300"
                                        style={{accentColor: '#7C3F8C'}}
                                    />
                                    <label className="ml-3 block text-sm font-medium text-gray-700">
                                        Product is active and available for sale
                                    </label>
                                </div>

                                <div className="flex space-x-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditForm(false);
                                            setEditingProduct(null);
                                            resetForm();
                                        }}
                                        disabled={formLoading}
                                        className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-105 flex items-center justify-center space-x-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)',
                                            boxShadow: '0 8px 32px rgba(124, 63, 140, 0.3)'
                                        }}
                                    >
                                        {formLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>✏️</span>
                                                <span>Update Product</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProducts;