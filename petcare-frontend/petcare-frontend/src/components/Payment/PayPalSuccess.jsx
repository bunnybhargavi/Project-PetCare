import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';

const PayPalSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handlePayPalReturn = async () => {
            try {
                const paymentId = searchParams.get('paymentId');
                const payerId = searchParams.get('PayerID');

                if (!paymentId || !payerId) {
                    throw new Error('Missing payment parameters');
                }

                // Verify payment with backend
                const response = await paymentService.handlePayPalReturn(paymentId, payerId);

                if (response.success) {
                    // Clear stored payment data
                    sessionStorage.removeItem('paypalPaymentData');
                    
                    // Redirect to success page or order confirmation
                    setTimeout(() => {
                        navigate('/orders', { 
                            state: { 
                                message: 'Payment successful! Your order has been confirmed.',
                                orderId: response.data.orderId 
                            }
                        });
                    }, 2000);
                } else {
                    throw new Error('Payment verification failed');
                }
            } catch (error) {
                console.error('PayPal return handling failed:', error);
                setError(error.message || 'Payment verification failed');
                setLoading(false);
            }
        };

        handlePayPalReturn();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="payment-status-container">
                <div className="payment-status-card">
                    <div className="loading-spinner"></div>
                    <h2>Processing Payment...</h2>
                    <p>Please wait while we verify your PayPal payment.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-status-container">
                <div className="payment-status-card error">
                    <div className="error-icon">❌</div>
                    <h2>Payment Verification Failed</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/shop')} className="btn-primary">
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-status-container">
            <div className="payment-status-card success">
                <div className="success-icon">✅</div>
                <h2>Payment Successful!</h2>
                <p>Your PayPal payment has been processed successfully.</p>
                <p>Redirecting to your orders...</p>
            </div>
        </div>
    );
};

export default PayPalSuccess;