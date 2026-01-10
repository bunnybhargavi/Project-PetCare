import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';

const PayPalCancel = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handlePayPalCancel = async () => {
            try {
                const paymentId = searchParams.get('paymentId');
                
                if (paymentId) {
                    // Handle payment cancellation
                    await paymentService.handlePayPalCancel(paymentId);
                }

                // Clear stored payment data
                sessionStorage.removeItem('paypalPaymentData');
            } catch (error) {
                console.error('Error handling PayPal cancellation:', error);
            }
        };

        handlePayPalCancel();
    }, [searchParams]);

    return (
        <div className="payment-status-container">
            <div className="payment-status-card cancelled">
                <div className="cancel-icon">⚠️</div>
                <h2>Payment Cancelled</h2>
                <p>Your PayPal payment was cancelled. No charges were made to your account.</p>
                <p>You can try again or choose a different payment method.</p>
                
                <div className="action-buttons">
                    <button onClick={() => navigate('/cart')} className="btn-secondary">
                        Return to Cart
                    </button>
                    <button onClick={() => navigate('/shop')} className="btn-primary">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayPalCancel;