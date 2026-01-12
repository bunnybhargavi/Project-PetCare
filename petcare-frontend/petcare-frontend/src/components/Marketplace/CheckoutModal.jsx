import React, { useState } from 'react';
import { FaTimes, FaCreditCard, FaLock, FaCheck } from 'react-icons/fa';
import { orderService } from '../../services/orderService';

const CheckoutModal = ({ cart, onClose, onOrderComplete }) => {
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);

    const [shippingInfo, setShippingInfo] = useState({
        shippingName: '',
        shippingAddress: '',
        shippingCity: '',
        shippingState: '',
        shippingZipCode: '',
        shippingPhone: ''
    });

    const [paymentInfo, setPaymentInfo] = useState({
        paymentMethod: 'CREDIT_CARD',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardName: ''
    });

    const [notes, setNotes] = useState('');

    const subtotal = cart?.totalAmount || 0;
    const shippingCost = subtotal >= 500 ? 0 : 59.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // Simulate payment processing
            const paymentTransactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            const checkoutData = {
                ...shippingInfo,
                paymentMethod: paymentInfo.paymentMethod,
                paymentTransactionId,
                notes
            };

            const response = await orderService.createOrder(checkoutData);
            setOrder(response.data);
            setStep(3);
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleOrderComplete = () => {
        onOrderComplete();
        onClose();
    };

    const renderShippingStep = () => (
        <form onSubmit={handleShippingSubmit} className="checkout-form">
            <h3>Shipping Information</h3>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        value={shippingInfo.shippingName}
                        onChange={(e) => setShippingInfo({...shippingInfo, shippingName: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        value={shippingInfo.shippingPhone}
                        onChange={(e) => setShippingInfo({...shippingInfo, shippingPhone: e.target.value})}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Address *</label>
                <input
                    type="text"
                    value={shippingInfo.shippingAddress}
                    onChange={(e) => setShippingInfo({...shippingInfo, shippingAddress: e.target.value})}
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>City *</label>
                    <input
                        type="text"
                        value={shippingInfo.shippingCity}
                        onChange={(e) => setShippingInfo({...shippingInfo, shippingCity: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>State *</label>
                    <input
                        type="text"
                        value={shippingInfo.shippingState}
                        onChange={(e) => setShippingInfo({...shippingInfo, shippingState: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                        type="text"
                        value={shippingInfo.shippingZipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, shippingZipCode: e.target.value})}
                        required
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                </button>
                <button type="submit" className="btn-primary">
                    Continue to Payment
                </button>
            </div>
        </form>
    );

    const renderPaymentStep = () => (
        <form onSubmit={handlePaymentSubmit} className="checkout-form">
            <h3>Payment Information</h3>
            
            <div className="payment-methods">
                <label className="payment-method">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="CREDIT_CARD"
                        checked={paymentInfo.paymentMethod === 'CREDIT_CARD'}
                        onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value})}
                    />
                    <FaCreditCard /> Credit Card
                </label>
                <label className="payment-method">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYPAL"
                        checked={paymentInfo.paymentMethod === 'PAYPAL'}
                        onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value})}
                    />
                    💳 PayPal
                </label>
                <label className="payment-method">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH_ON_DELIVERY"
                        checked={paymentInfo.paymentMethod === 'CASH_ON_DELIVERY'}
                        onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value})}
                    />
                    💵 Cash on Delivery
                </label>
            </div>

            {paymentInfo.paymentMethod === 'CREDIT_CARD' && (
                <div className="credit-card-form">
                    <div className="form-group">
                        <label>Cardholder Name *</label>
                        <input
                            type="text"
                            value={paymentInfo.cardName}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Card Number *</label>
                        <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Expiry Date *</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={paymentInfo.expiryDate}
                                onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>CVV *</label>
                            <input
                                type="text"
                                placeholder="123"
                                value={paymentInfo.cvv}
                                onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="form-group">
                <label>Order Notes (Optional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    rows="3"
                />
            </div>

            <div className="security-notice">
                <FaLock /> Your payment information is secure and encrypted
            </div>

            <div className="form-actions">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Back to Shipping
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Processing...' : `Place Order - ₹${total.toFixed(2)}`}
                </button>
            </div>
        </form>
    );

    const renderConfirmationStep = () => (
        <div className="order-confirmation">
            <div className="success-icon">
                <FaCheck />
            </div>
            
            <h3>Order Placed Successfully!</h3>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
            
            <div className="order-details">
                <div className="detail-row">
                    <span>Order Number:</span>
                    <span className="order-number">{order?.orderNumber}</span>
                </div>
                <div className="detail-row">
                    <span>Total Amount:</span>
                    <span>₹{order?.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                    <span>Payment Status:</span>
                    <span className="status">{order?.paymentStatus}</span>
                </div>
                <div className="detail-row">
                    <span>Order Status:</span>
                    <span className="status">{order?.status}</span>
                </div>
            </div>

            <div className="confirmation-actions">
                <button onClick={handleOrderComplete} className="btn-primary">
                    Continue Shopping
                </button>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Checkout</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="checkout-progress">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Shipping</span>
                    </div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Payment</span>
                    </div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-number">3</span>
                        <span className="step-label">Confirmation</span>
                    </div>
                </div>

                <div className="checkout-content">
                    <div className="checkout-main">
                        {step === 1 && renderShippingStep()}
                        {step === 2 && renderPaymentStep()}
                        {step === 3 && renderConfirmationStep()}
                    </div>

                    {step < 3 && (
                        <div className="order-summary">
                            <h4>Order Summary</h4>
                            
                            <div className="summary-items">
                                {cart?.items?.map((item) => (
                                    <div key={item.id} className="summary-item">
                                        <span className="item-name">
                                            {item.product.title} x {item.quantity}
                                        </span>
                                        <span className="item-price">
                                            ₹{item.totalPrice?.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping:</span>
                                    <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="total-row">
                                    <span>Tax:</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="total-row final">
                                    <span>Total:</span>
                                    <span>₹{total.toFixed(2)}</span>
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