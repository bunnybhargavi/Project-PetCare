import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaLock, FaCheck, FaUser, FaPhone, FaMapMarkerAlt, FaShippingFast, FaTruck, FaPlus, FaMinus } from 'react-icons/fa';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { cartService } from '../../services/cartService';

const CheckoutModal = ({ cart, onClose, onOrderComplete, onCartUpdate }) => {
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const [shippingOption, setShippingOption] = useState('standard');
    const [quantityLoading, setQuantityLoading] = useState({});
    const [showCoupon, setShowCoupon] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [paymentData, setPaymentData] = useState(null);
    const [paypalLoaded, setPaypalLoaded] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        shippingName: '',
        shippingAddress: '',
        shippingCity: '',
        shippingState: '',
        shippingZipCode: '',
        shippingPhone: ''
    });

    const [paymentInfo, setPaymentInfo] = useState({
        paymentMethod: 'PAYPAL'
    });

    const [notes, setNotes] = useState('');

    const subtotal = cart?.totalAmount || 0;
    const baseShippingCost = subtotal >= 50 ? 0 : 5.99;
    const shippingCost = shippingOption === 'express' ? 12.99 : baseShippingCost;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    // Load PayPal script and test configuration on component mount
    useEffect(() => {
        const initializePayment = async () => {
            try {
                // Load PayPal script first (this doesn't require auth)
                const loaded = await paymentService.loadPayPalScript();
                setPaypalLoaded(loaded);

                if (!loaded) {
                    console.error('Failed to load PayPal script');
                }

                // Try to test backend configuration (optional - don't fail if auth required)
                try {
                    const configTest = await paymentService.testConfiguration();
                    console.log('Payment configuration test:', configTest);

                    if (!configTest.success || !configTest.data.ready) {
                        console.warn('Payment configuration not ready:', configTest.data.status);
                    }
                } catch (configError) {
                    // If config test fails (e.g., due to auth), just log it but don't fail initialization
                    console.warn('Could not test payment configuration (may require login):', configError);
                }

            } catch (error) {
                console.error('Error initializing payment system:', error);
            }
        };

        initializePayment();
    }, []);

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Check if user is logged in
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('Please log in to complete your purchase.');
                setLoading(false);
                return;
            }

            // Check if cart has items
            if (!cart || !cart.items || cart.items.length === 0) {
                alert('Your cart is empty. Please add items to your cart before checkout.');
                setLoading(false);
                return;
            }

            // First create or get existing order
            let createdOrder = order;

            if (!createdOrder) {
                const checkoutData = {
                    ...shippingInfo,
                    paymentMethod: paymentInfo.paymentMethod,
                    notes
                };

                console.log('Creating order with data:', checkoutData);
                const orderResponse = await orderService.createOrder(checkoutData);
                createdOrder = orderResponse.data;
                setOrder(createdOrder);
                console.log('Order created:', createdOrder);
            } else {
                console.log('Using existing order:', createdOrder);
            }

            // Create payment order with PayPal
            const paymentRequest = {
                orderId: createdOrder.id,
                amount: Number(total.toFixed(2)), // Convert to number with 2 decimal places
                currency: 'INR',
                receipt: createdOrder.orderNumber
            };

            console.log('Creating payment order with request:', paymentRequest);
            const paymentResponse = await paymentService.createPaymentOrder(paymentRequest);

            if (!paymentResponse.success) {
                throw new Error(paymentResponse.message || 'Failed to create payment order');
            }

            const paymentOrderData = paymentResponse.data;
            setPaymentData(paymentOrderData);
            console.log('Payment order created:', paymentOrderData);

            // Initialize payment (works with both real PayPal and mock)
            paymentService.initializePayPalPayment(
                paymentOrderData,
                handlePaymentSuccess,
                handlePaymentFailure
            );

        } catch (error) {
            console.error('Payment initialization failed:', error);
            let errorMessage = 'Payment initialization failed';

            if (error.response?.data) {
                console.error('Error response data:', error.response.data);
                // If it's a validation error object or detailed message
                errorMessage += ': ' + (typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data);
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }

            alert(errorMessage);
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (verificationData) => {
        try {
            // Verify payment with backend
            const verificationResponse = await paymentService.verifyPayment(verificationData);

            if (verificationResponse.success) {
                // Update local order state to reflect success
                setOrder(prevOrder => ({
                    ...prevOrder,
                    status: 'CONFIRMED',
                    paymentStatus: 'PAID'
                }));

                setStep(3); // Move to confirmation step
                console.log('Payment successful:', verificationResponse.data);
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentFailure = async (failureData) => {
        try {
            // Handle payment failure
            await paymentService.handlePaymentFailure(failureData);
            alert('Payment failed. Please try again.');
        } catch (error) {
            console.error('Error handling payment failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderComplete = () => {
        onOrderComplete();
        onClose();
    };

    // Quantity update handlers
    const handleQuantityUpdate = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            setQuantityLoading(prev => ({ ...prev, [cartItemId]: true }));
            await cartService.updateCartItem(cartItemId, newQuantity);

            // Refresh cart data
            if (onCartUpdate) {
                await onCartUpdate();
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
            alert('Failed to update quantity. Please try again.');
        } finally {
            setQuantityLoading(prev => ({ ...prev, [cartItemId]: false }));
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            setQuantityLoading(prev => ({ ...prev, [cartItemId]: true }));
            await cartService.removeFromCart(cartItemId);

            // Refresh cart data
            if (onCartUpdate) {
                await onCartUpdate();
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
            alert('Failed to remove item. Please try again.');
        } finally {
            setQuantityLoading(prev => ({ ...prev, [cartItemId]: false }));
        }
    };

    const getProductImage = (product) => {
        // First priority: Use actual uploaded images if available
        if (product.images && product.images.length > 0) {
            const imageUrl = product.images[0];
            return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
        }

        // Second priority: Specific product image mapping
        const productImageMap = {
            'Car Safety Harness': 'https://m.media-amazon.com/images/I/71oCswWyDbL.jpg',
            'Airline Approved Pet Carrier': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnHvTSMTUlkcGAtLBWnnVjBF-H_u4lixQvEA&s',
            'Anti-Bark Training Collar': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm2xOVYQ9O4TfcDsV-27DLnWX3iO7u5Old3w&s',
            'LED Safety Dog Collar': 'https://qpets.in/cdn/shop/files/71s0pKxjegL_f84a942f-02fa-4016-bb22-5f594c65cdd1.jpg?v=1766180936',
            'Premium Dog Food - Chicken & Rice': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop&auto=format',
            'Interactive Puzzle Toy': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=400&fit=crop&auto=format',
            'Orthopedic Dog Bed': 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=400&fit=crop&auto=format',
            'Professional Dog Brush': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&h=400&fit=crop&auto=format'
        };

        const specificImage = productImageMap[product.title];
        if (specificImage) {
            return specificImage;
        }

        // Third priority: Category-based fallback images
        const categoryImages = {
            'FOOD': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop&auto=format',
            'TOYS': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&h=400&fit=crop&auto=format',
            'HEALTH': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=400&fit=crop&auto=format',
            'GROOMING': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&h=400&fit=crop&auto=format',
            'ACCESSORIES': 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500&h=400&fit=crop&auto=format',
            'BEDS': 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=400&fit=crop&auto=format',
            'TRAINING': 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500&h=400&fit=crop&auto=format',
            'TRAVEL': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop&auto=format'
        };

        return categoryImages[product.category] || 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=400&fit=crop&auto=format';
    };

    const renderShippingStep = () => (
        <div className="pet-checkout-form">
            <form onSubmit={handleShippingSubmit}>
                {/* Shipping Information Card */}
                <div className="pet-form-card">
                    <div className="pet-card-header">
                        <span className="pet-card-icon">📦</span>
                        <h3>Shipping Information</h3>
                    </div>

                    <div className="pet-form-grid">
                        <div className="pet-form-group">
                            <div className="pet-input-wrapper">
                                <FaUser className="pet-input-icon" />
                                <input
                                    type="text"
                                    value={shippingInfo.shippingName}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, shippingName: e.target.value })}
                                    required
                                    className="pet-input"
                                    placeholder=" "
                                />
                                <label className="pet-floating-label">Full Name *</label>
                            </div>
                        </div>

                        <div className="pet-form-group">
                            <div className="pet-input-wrapper">
                                <FaPhone className="pet-input-icon" />
                                <input
                                    type="tel"
                                    value={shippingInfo.shippingPhone}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, shippingPhone: e.target.value })}
                                    className="pet-input"
                                    placeholder=" "
                                />
                                <label className="pet-floating-label">Phone Number</label>
                            </div>
                        </div>
                    </div>

                    <div className="pet-form-group">
                        <div className="pet-input-wrapper">
                            <FaMapMarkerAlt className="pet-input-icon" />
                            <input
                                type="text"
                                value={shippingInfo.shippingAddress}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, shippingAddress: e.target.value })}
                                required
                                className="pet-input"
                                placeholder=" "
                            />
                            <label className="pet-floating-label">Address *</label>
                        </div>
                    </div>

                    <div className="pet-form-grid pet-grid-three">
                        <div className="pet-form-group">
                            <div className="pet-input-wrapper">
                                <input
                                    type="text"
                                    value={shippingInfo.shippingCity}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, shippingCity: e.target.value })}
                                    required
                                    className="pet-input"
                                    placeholder=" "
                                />
                                <label className="pet-floating-label">City *</label>
                            </div>
                        </div>
                        <div className="pet-form-group">
                            <div className="pet-input-wrapper">
                                <input
                                    type="text"
                                    value={shippingInfo.shippingState}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, shippingState: e.target.value })}
                                    required
                                    className="pet-input"
                                    placeholder=" "
                                />
                                <label className="pet-floating-label">State *</label>
                            </div>
                        </div>
                        <div className="pet-form-group">
                            <div className="pet-input-wrapper">
                                <input
                                    type="text"
                                    value={shippingInfo.shippingZipCode}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, shippingZipCode: e.target.value })}
                                    required
                                    className="pet-input"
                                    placeholder=" "
                                />
                                <label className="pet-floating-label">ZIP Code *</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Options Card */}
                <div className="pet-form-card">
                    <div className="pet-card-header">
                        <span className="pet-card-icon">🚚</span>
                        <h3>Shipping Options</h3>
                    </div>

                    <div className="pet-shipping-options">
                        <label className={`pet-shipping-option ${shippingOption === 'standard' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="shipping"
                                value="standard"
                                checked={shippingOption === 'standard'}
                                onChange={(e) => setShippingOption(e.target.value)}
                            />
                            <div className="pet-option-content">
                                <div className="pet-option-header">
                                    <FaTruck className="pet-option-icon standard" />
                                    <div className="pet-option-details">
                                        <span className="pet-option-name">Standard Shipping</span>
                                        <span className="pet-option-time">5-7 business days</span>
                                    </div>
                                    <span className="pet-option-price standard">
                                        {subtotal >= 50 ? 'FREE' : '₹5.99'}
                                    </span>
                                </div>
                                <div className="pet-paw-decoration">
                                    <span>🐾</span>
                                    <span>🐾</span>
                                </div>
                            </div>
                        </label>

                        <label className={`pet-shipping-option ${shippingOption === 'express' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="shipping"
                                value="express"
                                checked={shippingOption === 'express'}
                                onChange={(e) => setShippingOption(e.target.value)}
                            />
                            <div className="pet-option-content">
                                <div className="pet-option-header">
                                    <FaShippingFast className="pet-option-icon express" />
                                    <div className="pet-option-details">
                                        <span className="pet-option-name">Express Shipping</span>
                                        <span className="pet-option-time">2-3 business days</span>
                                    </div>
                                    <span className="pet-option-price express">₹12.99</span>
                                </div>
                                <div className="pet-paw-decoration">
                                    <span>🐾</span>
                                    <span>🐾</span>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="pet-bone-divider">
                    <span>🦴</span>
                </div>

                <div className="pet-form-actions">
                    <button type="button" onClick={onClose} className="pet-btn-secondary">
                        <span>Cancel</span>
                    </button>
                    <button type="submit" className="pet-btn-primary">
                        <span>Continue to Payment</span>
                        <span className="pet-btn-paw">🐾</span>
                    </button>
                </div>
            </form>
        </div>
    );

    const renderPaymentStep = () => (
        <div className="pet-checkout-form">
            <form onSubmit={handlePaymentSubmit}>
                {/* Payment Information Card */}
                <div className="pet-form-card">
                    <div className="pet-card-header">
                        <span className="pet-card-icon">💳</span>
                        <h3>Payment Information</h3>
                    </div>

                    <div className="pet-payment-methods">
                        <label className={`pet-payment-method ${paymentInfo.paymentMethod === 'PAYPAL' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="PAYPAL"
                                checked={paymentInfo.paymentMethod === 'PAYPAL'}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentMethod: e.target.value })}
                            />
                            <div className="pet-method-content">
                                <span className="pet-method-icon">💳</span>
                                <span>PayPal (Secure Payment)</span>
                            </div>
                        </label>

                        <label className={`pet-payment-method ${paymentInfo.paymentMethod === 'TEST_PAYMENT' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="TEST_PAYMENT"
                                checked={paymentInfo.paymentMethod === 'TEST_PAYMENT'}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentMethod: e.target.value })}
                            />
                            <div className="pet-method-content">
                                <span className="pet-method-icon">🧪</span>
                                <span>Test Payment (Mock)</span>
                            </div>
                        </label>

                        <label className={`pet-payment-method ${paymentInfo.paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="CASH_ON_DELIVERY"
                                checked={paymentInfo.paymentMethod === 'CASH_ON_DELIVERY'}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentMethod: e.target.value })}
                            />
                            <div className="pet-method-content">
                                <span className="pet-method-icon">💵</span>
                                <span>Cash on Delivery</span>
                            </div>
                        </label>
                    </div>

                    {paymentInfo.paymentMethod === 'PAYPAL' && (
                        <div className="pet-payment-info">
                            <div className="pet-info-box paypal">
                                <span className="pet-info-icon">🔒</span>
                                <div>
                                    <strong>Secure Payment with PayPal</strong>
                                    <p>Pay securely using your PayPal account or credit/debit cards through PayPal. Your payment information is encrypted and secure.</p>
                                    <div className="pet-test-card-info">
                                        <strong>For Testing (Sandbox Mode):</strong>
                                        <p>If PayPal is not configured, a mock payment will be processed automatically.</p>
                                        <p><strong>Test PayPal Account:</strong> Use PayPal sandbox credentials for testing</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentInfo.paymentMethod === 'TEST_PAYMENT' && (
                        <div className="pet-payment-info">
                            <div className="pet-info-box test">
                                <span className="pet-info-icon">🧪</span>
                                <div>
                                    <strong>Test Payment Mode</strong>
                                    <p>This will simulate a successful payment transaction without charging any real money. Useful for testing the order flow.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentInfo.paymentMethod === 'CASH_ON_DELIVERY' && (
                        <div className="pet-payment-info">
                            <div className="pet-info-box cod">
                                <span className="pet-info-icon">💵</span>
                                <div>
                                    <p>Pay with cash when your order is delivered to your door.</p>
                                    <p><strong>Additional fee:</strong> ₹2.99</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Notes Card */}
                <div className="pet-form-card">
                    <div className="pet-card-header">
                        <span className="pet-card-icon">📝</span>
                        <h3>Order Notes (Optional)</h3>
                    </div>

                    <div className="pet-form-group">
                        <div className="pet-textarea-wrapper">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special instructions for your order..."
                                rows="3"
                                className="pet-textarea"
                            />
                        </div>
                    </div>
                </div>

                <div className="pet-security-notice">
                    <FaLock className="pet-security-icon" />
                    <span>Your payment information is secure and encrypted</span>
                    <div className="pet-security-badges">
                        <span className="pet-badge">🔒 SSL</span>
                        <span className="pet-badge">🛡️ Secure</span>
                    </div>
                </div>

                <div className="pet-bone-divider">
                    <span>🦴</span>
                </div>

                <div className="pet-form-actions">
                    <button type="button" onClick={() => setStep(1)} className="pet-btn-secondary">
                        <span>← Back to Shipping</span>
                    </button>
                    <button type="submit" disabled={loading} className="pet-btn-primary">
                        {loading ? (
                            <>
                                <div className="pet-loading-paws">
                                    <span>🐾</span>
                                    <span>🐾</span>
                                </div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Place Order - ₹{total.toFixed(2)}</span>
                                <span className="pet-btn-paw">🐾</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderConfirmationStep = () => (
        <div className="pet-order-confirmation">
            <div className="pet-success-animation pet-success-aligned-to-payment">
                <div className="pet-success-icon">
                    <FaCheck />
                </div>
                <div className="pet-success-ripple"></div>
                <div className="pet-success-paws">
                    <span>🐾</span>
                    <span>🐾</span>
                    <span>🐾</span>
                </div>
            </div>

            <div className="pet-confirmation-content">
                <h3>🎉 Order Placed Successfully!</h3>
                <p>Thank you for your purchase! Your furry friend's order has been confirmed and will be processed with love.</p>

                <div className="pet-order-details">
                    <div className="pet-detail-row">
                        <span>Order Number:</span>
                        <span className="pet-order-number">{order?.orderNumber}</span>
                    </div>
                    <div className="pet-detail-row">
                        <span>Total Amount:</span>
                        <span className="pet-amount">₹{order?.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="pet-detail-row">
                        <span>Payment Status:</span>
                        <span className="pet-status success">{order?.paymentStatus}</span>
                    </div>
                    <div className="pet-detail-row">
                        <span>Order Status:</span>
                        <span className="pet-status pending">{order?.status}</span>
                    </div>
                    <div className="pet-detail-row">
                        <span>Estimated Delivery:</span>
                        <span>{shippingOption === 'express' ? '2-3 business days' : '5-7 business days'}</span>
                    </div>
                </div>

                <div className="pet-next-steps">
                    <h4>🐾 What's Next?</h4>
                    <ul className="pet-steps-list">
                        <li><span className="pet-bullet">🐾</span> You'll receive an email confirmation shortly</li>
                        <li><span className="pet-bullet">🐾</span> We'll send tracking information once your order ships</li>
                        <li><span className="pet-bullet">🐾</span> Your order will be delivered with care to your door</li>
                    </ul>
                </div>

                <div className="pet-confirmation-actions">
                    <button onClick={handleOrderComplete} className="pet-btn-primary large">
                        <span>Continue Shopping</span>
                        <span className="pet-btn-paw">🐾</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="pet-modal-overlay" onClick={onClose}>
            <div className="pet-checkout-modal" onClick={(e) => e.stopPropagation()}>
                {/* Pet-themed Background Pattern */}
                <div className="pet-background-pattern">
                    <span className="pet-bg-paw">🐾</span>
                    <span className="pet-bg-paw">🐾</span>
                    <span className="pet-bg-paw">🐾</span>
                    <span className="pet-bg-paw">🐾</span>
                    <span className="pet-bg-paw">🐾</span>
                </div>

                {/* Header */}
                <div className="pet-modal-header">
                    <h2 className="pet-checkout-title">
                        <span className="pet-title-icon">🛒</span>
                        Pet Paradise Checkout
                        <span className="pet-title-paw">🐾</span>
                    </h2>
                    <button className="pet-modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Progress Indicator with Paw Prints */}
                <div className="pet-checkout-progress">
                    <div className={`pet-progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <span className="pet-step-icon">{step > 1 ? <FaCheck /> : '🐾'}</span>
                        <span className="pet-step-label">Shipping</span>
                    </div>
                    <div className="pet-progress-line"></div>
                    <div className={`pet-progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <span className="pet-step-icon">{step > 2 ? <FaCheck /> : '🐾'}</span>
                        <span className="pet-step-label">Payment</span>
                    </div>
                    <div className="pet-progress-line"></div>
                    <div className={`pet-progress-step ${step >= 3 ? 'active' : ''}`}>
                        <span className="pet-step-icon">🐾</span>
                        <span className="pet-step-label">Confirmation</span>
                    </div>
                </div>

                {/* Two-Column Layout */}
                <div className="pet-checkout-content">
                    {/* Left Column - Forms */}
                    <div className="pet-checkout-main">
                        {step === 1 && renderShippingStep()}
                        {step === 2 && renderPaymentStep()}
                        {step === 3 && renderConfirmationStep()}
                    </div>

                    {/* Right Column - Order Summary (Sticky) */}
                    {step < 3 && (
                        <div className="pet-order-summary">
                            <div className="pet-summary-card">
                                <div className="pet-summary-header">
                                    <span className="pet-summary-icon">📋</span>
                                    <h4>Order Summary</h4>
                                </div>

                                <div className="pet-summary-items">
                                    {cart?.items?.map((item) => (
                                        <div key={item.id} className="pet-summary-item">
                                            <div className="pet-item-image">
                                                <img
                                                    src={getProductImage(item.product)}
                                                    alt={item.product.title}
                                                />
                                            </div>
                                            <div className="pet-item-details">
                                                <span className="pet-item-name">{item.product.title}</span>
                                                <span className="pet-item-brand">{item.product.brand || item.product.categoryDisplayName}</span>

                                                {/* Quantity Controls */}
                                                <div className="pet-quantity-controls">
                                                    <button
                                                        className="pet-quantity-btn decrease"
                                                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                                        disabled={quantityLoading[item.id] || item.quantity <= 1}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="pet-quantity-display">
                                                        {quantityLoading[item.id] ? '...' : item.quantity}
                                                    </span>
                                                    <button
                                                        className="pet-quantity-btn increase"
                                                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                                        disabled={quantityLoading[item.id] || item.quantity >= (item.product.stock || 99)}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>

                                                {/* Remove Item Button */}
                                                <button
                                                    className="pet-remove-item-btn"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={quantityLoading[item.id]}
                                                    title="Remove item"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                            <span className="pet-item-price">₹{item.totalPrice?.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pet-bone-divider">
                                    <span>🦴</span>
                                </div>

                                <div className="pet-summary-totals">
                                    <div className="pet-total-row">
                                        <span>Subtotal:</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="pet-total-row">
                                        <span>Shipping:</span>
                                        <span className={shippingCost === 0 ? 'free' : ''}>
                                            {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="pet-total-row">
                                        <span>Tax (8%):</span>
                                        <span>₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="pet-total-row final">
                                        <span>Total:</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Coupon Section */}
                                <div className="pet-coupon-section">
                                    <button
                                        className="pet-coupon-toggle"
                                        onClick={() => setShowCoupon(!showCoupon)}
                                    >
                                        <span className="pet-coupon-icon">🎟️</span>
                                        <span>Apply Coupon Code</span>
                                        <span className="pet-toggle-arrow">{showCoupon ? '▲' : '▼'}</span>
                                    </button>

                                    {showCoupon && (
                                        <div className="pet-coupon-form">
                                            <div className="pet-coupon-input-wrapper">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    placeholder="Enter coupon code"
                                                    className="pet-coupon-input"
                                                />
                                                <button className="pet-coupon-apply">Apply</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {subtotal < 50 && (
                                    <div className="pet-free-shipping-notice">
                                        <span className="pet-notice-icon">💡</span>
                                        <span>Add ₹{(50 - subtotal).toFixed(2)} more for FREE shipping!</span>
                                    </div>
                                )}

                                {/* Secure Checkout Badge */}
                                <div className="pet-secure-badge">
                                    <FaLock className="pet-secure-icon" />
                                    <span>Secure Checkout</span>
                                    <div className="pet-security-icons">
                                        <span>🔒</span>
                                        <span>🛡️</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;