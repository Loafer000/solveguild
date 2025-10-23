import React, { useState } from 'react';
import { loadScript } from '@razorpay/react';
import { CreditCard, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RazorpayPayment = ({ 
  amount, 
  currency = 'INR', 
  planName, 
  planId, 
  onSuccess, 
  onError,
  userEmail,
  userName 
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const displayRazorpay = async () => {
    setLoading(true);
    
    try {
      // Load Razorpay script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      
      if (!res) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order on backend
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          planId,
          planName
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency,
        name: 'SolveGuild',
        description: `Premium Subscription - ${planName}`,
        image: '/logo.png',
        order_id: orderData.order.id,
        handler: async function (response) {
          setPaymentId(response.razorpay_payment_id);
          
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payments/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              planId
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast.success('Payment successful! Premium activated.');
            onSuccess && onSuccess(verifyData.subscription);
          } else {
            toast.error('Payment verification failed');
            onError && onError(verifyData.message);
          }
        },
        prefill: {
          name: userName || '',
          email: userEmail || '',
          contact: ''
        },
        notes: {
          plan: planName,
          planId
        },
        theme: {
          color: '#3B82F6',
          background: '#1F2937'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
      onError && onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Payment Details</h3>
        <div className="flex items-center text-green-400">
          <Shield className="w-5 h-5 mr-2" />
          <span className="text-sm">Secure Payment</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Plan</span>
          <span className="text-white font-medium">{planName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Amount</span>
          <span className="text-white font-medium">₹{amount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Currency</span>
          <span className="text-white font-medium">{currency}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-400">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          <span>SSL Secured Payment</span>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          <span>Instant Activation</span>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          <span>Cancel Anytime</span>
        </div>
      </div>

      <button
        onClick={displayRazorpay}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ₹{amount}
          </>
        )}
      </button>

      {paymentId && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">
            Payment ID: {paymentId}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Powered by Razorpay • Secure & Encrypted
      </div>
    </div>
  );
};

export default RazorpayPayment;
