import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import RazorpayPayment from '../components/payment/RazorpayPayment';
import { useAuth } from '../contexts/AuthContext';

const Premium = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const queryClient = useQueryClient();

  // Fetch premium plans
  const { data: plansData, isLoading: plansLoading } = useQuery(
    'premium-plans',
    () => axios.get('/api/premium/plans').then(res => res.data)
  );

  // Fetch current subscription status
  const { data: subscriptionData } = useQuery(
    'premium-status',
    () => axios.get('/api/premium/status').then(res => res.data),
    {
      enabled: !!user
    }
  );

  const subscribeMutation = useMutation(
    (planId) => axios.post('/api/premium/subscribe', { planId }),
    {
      onSuccess: (response) => {
        toast.success('Premium subscription activated!');
        queryClient.invalidateQueries('premium-status');
        setShowPayment(false);
        setSelectedPlan(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Subscription failed');
      }
    }
  );

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (subscription) => {
    subscribeMutation.mutate(selectedPlan.id);
  };

  const handlePaymentError = (error) => {
    toast.error(error);
    setShowPayment(false);
    setSelectedPlan(null);
  };

  const features = [
    {
      icon: Zap,
      title: 'Enhanced Visibility',
      description: 'Your issues appear at the top of search results',
      free: false,
      premium: true
    },
    {
      icon: Clock,
      title: 'Early Notifications',
      description: 'Get notified 1 day before other freelancers',
      free: false,
      premium: true
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 priority customer support',
      free: false,
      premium: true
    },
    {
      icon: Users,
      title: 'Exclusive Community',
      description: 'Access to premium freelancer community',
      free: false,
      premium: true
    },
    {
      icon: Star,
      title: 'Advanced Analytics',
      description: 'Detailed insights and performance metrics',
      free: false,
      premium: true
    },
    {
      icon: Crown,
      title: 'Custom Branding',
      description: 'Personalized profile and portfolio themes',
      free: false,
      premium: true
    }
  ];

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading premium plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade to <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Premium</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Unlock exclusive features and get ahead of the competition with our premium subscription plans.
          </p>
        </div>

        {/* Current Status */}
        {subscriptionData?.isActive && (
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-green-400 mr-3" />
              <div>
                <h3 className="text-green-400 font-semibold">Premium Active</h3>
                <p className="text-gray-300 text-sm">
                  {subscriptionData.subscription?.plan} plan • 
                  Expires {new Date(subscriptionData.subscription?.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plansData?.plans?.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-800 rounded-lg p-6 relative ${
                plan.id === 'annual' ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.id === 'annual' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                  <span className="text-gray-400 text-sm ml-1">
                    /{plan.id === 'monthly' ? 'month' : 
                      plan.id === 'quarterly' ? '3 months' :
                      plan.id === 'semi-annual' ? '6 months' : 'year'}
                  </span>
                </div>
                {plan.id === 'annual' && (
                  <div className="text-green-400 text-sm font-medium">
                    Save 25% compared to monthly
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.id === 'annual'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {subscriptionData?.isActive ? 'Current Plan' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Compare Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 text-gray-300">Features</th>
                  <th className="text-center py-4 text-gray-300">Free</th>
                  <th className="text-center py-4 text-yellow-400">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-4">
                      <div className="flex items-center">
                        <feature.icon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-white font-medium">{feature.title}</div>
                          <div className="text-gray-400 text-sm">{feature.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4">
                      {feature.free ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="text-center py-4">
                      {feature.premium ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Get More Visibility</h3>
            <p className="text-gray-400">
              Your issues and profile get priority placement in search results
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Early Access</h3>
            <p className="text-gray-400">
              Be the first to know about new opportunities and projects
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Priority Support</h3>
            <p className="text-gray-400">
              Get 24/7 priority customer support for all your needs
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Go Premium?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of freelancers who are already using premium features to grow their business.
          </p>
          <button
            onClick={() => setSelectedPlan(plansData?.plans?.[0])}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Complete Payment</h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              <RazorpayPayment
                amount={selectedPlan.price}
                planName={selectedPlan.name}
                planId={selectedPlan.id}
                userEmail={user?.email}
                userName={user?.username}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
