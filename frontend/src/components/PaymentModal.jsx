import React, { useState, useEffect } from 'react';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  appointmentData, 
  onPaymentSuccess,
  onPaymentFailure 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('govt_coverage');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const [insuranceDetails, setInsuranceDetails] = useState({
    provider: '',
    policyNumber: ''
  });
  const [charges, setCharges] = useState(null);

  useEffect(() => {
    if (isOpen && appointmentData) {
      calculateCharges();
    }
  }, [isOpen, appointmentData]);

  const calculateCharges = () => {
    const baseRates = {
      'Cardiology': 100,
      'Neurology': 120,
      'Pediatrics': 80,
      'Dermatology': 90,
      'Orthopedics': 110,
      'General': 50
    };
    
    const baseAmount = baseRates[appointmentData.department] || 50;
    const durationMultiplier = appointmentData.duration / 30;
    const subtotal = baseAmount * durationMultiplier;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    setCharges({
      baseAmount,
      subtotal,
      tax,
      total,
      currency: 'USD'
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      let appointmentResult;
      let appointmentId;

      // For non-government coverage, validate payment first
      if (paymentMethod !== 'govt_coverage') {
        // Process payment first
        const paymentResponse = await fetch('http://localhost:5000/api/payments/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: charges.total,
            paymentMethod: paymentMethod,
            ...(paymentMethod === 'card' && { cardDetails }),
            ...(paymentMethod === 'insurance' && { insuranceDetails })
          })
        });

        const paymentData = await paymentResponse.json();

        if (!paymentData.success) {
          throw new Error(paymentData.message || 'Payment validation failed');
        }
      }

      // Create appointment after successful payment validation
      const appointmentResponse = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...appointmentData,
          paymentStatus: paymentMethod === 'govt_coverage' ? 'covered' : 'paid',
          paymentMethod: paymentMethod,
          amount: paymentMethod === 'govt_coverage' ? 0 : charges.total
        })
      });

      appointmentResult = await appointmentResponse.json();

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || 'Failed to create appointment');
      }

      appointmentId = appointmentResult.data.appointment._id;

      // For non-government coverage, process actual payment after appointment creation
      if (paymentMethod !== 'govt_coverage') {
        const finalPaymentResponse = await fetch('http://localhost:5000/api/payments/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            appointmentId: appointmentId,
            amount: charges.total,
            paymentMethod: paymentMethod,
            ...(paymentMethod === 'card' && { cardDetails }),
            ...(paymentMethod === 'insurance' && { insuranceDetails })
          })
        });

        const finalPaymentData = await finalPaymentResponse.json();

        if (!finalPaymentData.success) {
          // If final payment fails, delete the appointment
          await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          throw new Error(finalPaymentData.message || 'Final payment processing failed');
        }

        // Success with payment
        onPaymentSuccess({
          payment: finalPaymentData.data.payment,
          appointment: appointmentResult.data.appointment,
          transaction: finalPaymentData.data.transaction
        });
      } else {
        // Success with government coverage
        onPaymentSuccess({
          payment: {
            amount: 0,
            paymentMethod: 'govt_coverage',
            paymentStatus: 'covered'
          },
          appointment: appointmentResult.data.appointment,
          transaction: {
            status: 'covered'
          }
        });
      }

    } catch (error) {
      console.error('Payment process failed:', error);
      onPaymentFailure(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Card input formatting functions
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const matches = cleaned.match(/\d{1,4}/g);
    return matches ? matches.join(' ') : '';
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    setCardDetails(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const handleExpiryDateChange = (value) => {
    const formatted = formatExpiryDate(value);
    setCardDetails(prev => ({
      ...prev,
      expiryDate: formatted
    }));
  };

  const handleCvvChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setCardDetails(prev => ({
      ...prev,
      cvv: cleaned
    }));
  };

  const handleCardHolderChange = (value) => {
    setCardDetails(prev => ({
      ...prev,
      cardHolder: value
    }));
  };

  const handleInsuranceDetailChange = (field, value) => {
    setInsuranceDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCardBrand = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    return 'credit';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Complete Payment</h2>
              <p className="text-blue-100 text-sm mt-1">Secure payment processing</p>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="text-white hover:text-blue-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Appointment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Appointment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium text-right">Dr. {appointmentData.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{appointmentData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium text-right">
                  {new Date(appointmentData.dateTime).toLocaleDateString()} at {' '}
                  {new Date(appointmentData.dateTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{appointmentData.duration} minutes</span>
              </div>
              
              {/* Charges Breakdown */}
              {charges && (
                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span>{formatCurrency(charges.baseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration ({appointmentData.duration}min):</span>
                    <span>{formatCurrency(charges.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span>{formatCurrency(charges.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span className="text-green-600">{formatCurrency(charges.total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method *
            </label>
            <div className="space-y-3">
              {[
                { 
                  value: 'govt_coverage', 
                  label: 'Government Coverage', 
                  icon: '🏛️',
                  description: 'Fully covered by government healthcare'
                },
                { 
                  value: 'insurance', 
                  label: 'Health Insurance', 
                  icon: '🛡️',
                  description: 'Bill to your insurance provider'
                },
                { 
                  value: 'cash', 
                  label: 'Pay at Hospital', 
                  icon: '💵',
                  description: 'Pay when you visit the hospital'
                },
                { 
                  value: 'card', 
                  label: 'Credit/Debit Card', 
                  icon: '💳',
                  description: 'Secure online payment'
                }
              ].map(method => (
                <label 
                  key={method.value} 
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === method.value 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{method.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{method.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Insurance Details */}
          {paymentMethod === 'insurance' && (
            <div className="mb-6 space-y-4 bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-900">Insurance Information</h4>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Insurance Provider *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Blue Cross, Aetna, etc."
                  value={insuranceDetails.provider}
                  onChange={(e) => handleInsuranceDetailChange('provider', e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Policy Number *
                </label>
                <input
                  type="text"
                  placeholder="Your insurance policy number"
                  value={insuranceDetails.policyNumber}
                  onChange={(e) => handleInsuranceDetailChange('policyNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Card Details - IMPROVED DESIGN */}
          {paymentMethod === 'card' && (
            <div className="mb-6 space-y-4">
              <h4 className="font-medium text-gray-900">Card Details</h4>
              
              {/* Card Preview */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white mb-4">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-lg font-semibold">
                    {getCardBrand(cardDetails.cardNumber) === 'visa' && 'VISA'}
                    {getCardBrand(cardDetails.cardNumber) === 'mastercard' && 'MasterCard'}
                    {getCardBrand(cardDetails.cardNumber) === 'amex' && 'American Express'}
                    {getCardBrand(cardDetails.cardNumber) === 'discover' && 'Discover'}
                    {getCardBrand(cardDetails.cardNumber) === 'credit' && 'Credit Card'}
                  </div>
                  <div className="text-sm opacity-80">Debit/Credit</div>
                </div>
                <div className="text-xl font-mono tracking-wider mb-2">
                  {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-80">Card Holder</div>
                    <div className="text-sm font-medium">
                      {cardDetails.cardHolder || 'YOUR NAME'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs opacity-80">Expires</div>
                    <div className="text-sm font-medium">
                      {cardDetails.expiryDate || 'MM/YY'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      maxLength={19}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">$</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleExpiryDateChange(e.target.value)}
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-center"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Holder Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={(e) => handleCardHolderChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Notices */}
          {paymentMethod === 'govt_coverage' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <span className="text-green-800 font-medium">Government Coverage Applied</span>
                  <p className="text-green-600 text-sm mt-1">Your appointment will be fully covered under the National Healthcare Scheme. No payment required.</p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span className="text-yellow-800 font-medium">Pay at Hospital</span>
                  <p className="text-yellow-600 text-sm mt-1">Please bring exact change when you visit the hospital. Your appointment will be confirmed upon payment.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handlePayment}
              disabled={processing || 
                (paymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardHolder)) ||
                (paymentMethod === 'insurance' && (!insuranceDetails.provider || !insuranceDetails.policyNumber))
              }
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-4 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Complete Booking ${paymentMethod !== 'govt_coverage' ? `- ${formatCurrency(charges?.total || 0)}` : ''}`
              )}
            </button>
            <button
              onClick={onClose}
              disabled={processing}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center text-gray-500 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure SSL encrypted payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;