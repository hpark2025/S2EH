import { useState } from 'react';

const AddPaymentModal = ({ show, onClose, onSave }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [formData, setFormData] = useState({
    // GCash data
    gcashNumber: '',
    gcashName: '',
    // Card data
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    // Reset form data when switching methods
    setFormData({
      gcashNumber: '',
      gcashName: '',
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardType: ''
    });
  };

  const detectCardType = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    return '';
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setFormData(prev => ({
      ...prev,
      cardNumber: value,
      cardType: detectCardType(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    
    if (selectedMethod === 'gcash') {
      if (!formData.gcashNumber || !formData.gcashName) {
        alert('Please fill in all GCash details');
        return;
      }
      
      // Validate GCash number
      const gcashRegex = /^9\d{9}$/;
      if (!gcashRegex.test(formData.gcashNumber.replace(/\D/g, ''))) {
        alert('Please enter a valid GCash number (9xxxxxxxxx)');
        return;
      }
    }
    
    if (selectedMethod === 'card') {
      const requiredFields = ['cardNumber', 'cardName', 'expiryMonth', 'expiryYear', 'cvv'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        alert('Please fill in all card details');
        return;
      }
      
      // Basic card validation
      const cardNumber = formData.cardNumber.replace(/\D/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        alert('Please enter a valid card number');
        return;
      }
    }
    
    const paymentData = {
      method: selectedMethod,
      ...formData
    };
    
    if (onSave) {
      onSave(paymentData);
    }
    
    alert(`${selectedMethod === 'gcash' ? 'GCash' : 'Card'} added successfully!`);
    handleClose();
  };

  const handleClose = () => {
    setSelectedMethod('');
    setFormData({
      gcashNumber: '',
      gcashName: '',
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardType: ''
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Payment Method</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            {/* Payment Method Selection */}
            <div className="payment-options mb-4">
              <h6 className="mb-3">Select Payment Method</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div 
                    className={`payment-option border rounded p-3 text-center ${selectedMethod === 'gcash' ? 'border-primary bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleMethodSelect('gcash')}
                  >
                    <img 
                      src="/images/gcash.png" 
                      alt="GCash"
                      style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    />
                    <h6 className="mt-2">GCash</h6>
                    <small className="text-muted">Digital wallet payment</small>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div 
                    className={`payment-option border rounded p-3 text-center ${selectedMethod === 'card' ? 'border-primary bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleMethodSelect('card')}
                  >
                    <i className="bi bi-credit-card text-primary" style={{ fontSize: '3rem' }}></i>
                    <h6 className="mt-2">Credit/Debit Card</h6>
                    <small className="text-muted">Visa, Mastercard, etc.</small>
                  </div>
                </div>
              </div>
            </div>

            {/* GCash Form */}
            {selectedMethod === 'gcash' && (
              <div className="gcash-form">
                <h6 className="mb-3">GCash Details</h6>
                <div className="mb-3">
                  <label htmlFor="gcashNumber" className="form-label">GCash Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text">+63</span>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="gcashNumber"
                      name="gcashNumber"
                      value={formData.gcashNumber}
                      onChange={handleInputChange}
                      placeholder="9xxxxxxxxx"
                      required 
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="gcashName" className="form-label">Account Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="gcashName"
                    name="gcashName"
                    value={formData.gcashName}
                    onChange={handleInputChange}
                    placeholder="Name as registered in GCash"
                    required 
                  />
                </div>
              </div>
            )}

            {/* Card Form */}
            {selectedMethod === 'card' && (
              <div className="card-form">
                <h6 className="mb-3">Card Details</h6>
                <div className="mb-3">
                  <label htmlFor="cardNumber" className="form-label">Card Number</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required 
                    />
                    {formData.cardType && (
                      <span className="input-group-text">{formData.cardType}</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="cardName" className="form-label">Cardholder Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Name as printed on card"
                    required 
                  />
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="expiryMonth" className="form-label">Month</label>
                    <select 
                      className="form-control" 
                      id="expiryMonth"
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="expiryYear" className="form-label">Year</label>
                    <select 
                      className="form-control" 
                      id="expiryYear"
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="cvv" className="form-label">CVV</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="4"
                      required 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={!selectedMethod}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;