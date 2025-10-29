import { useState, useEffect } from 'react'

const ProcessRefundModal = ({ show, onClose, onProcessRefund, order }) => {
  const [orderId, setOrderId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [originalAmount, setOriginalAmount] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundMethod, setRefundMethod] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  
  // Payment method specific fields
  const [gcashNumber, setGcashNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  
  const [processingFee, setProcessingFee] = useState(0)
  const [netRefundAmount, setNetRefundAmount] = useState(0)
  const [adminNotes, setAdminNotes] = useState('')
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  // Refund reasons
  const refundReasons = [
    { value: 'order_cancelled', label: 'Order Cancelled' },
    { value: 'product_defective', label: 'Product Defective' },
    { value: 'wrong_item', label: 'Wrong Item Delivered' },
    { value: 'not_delivered', label: 'Item Not Delivered' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'duplicate_payment', label: 'Duplicate Payment' },
    { value: 'price_adjustment', label: 'Price Adjustment' },
    { value: 'other', label: 'Other (Please specify)' }
  ]

  // Populate form when order prop changes
  useEffect(() => {
    if (order) {
      setOrderId(order.id || '')
      setCustomerName(order.customer || '')
      setOriginalAmount(order.amount?.toString() || '')
      setRefundAmount(order.amount?.toString() || '')
      setRefundMethod('')
      setRefundReason('')
      setCustomReason('')
      setGcashNumber('')
      setBankName('')
      setAccountNumber('')
      setAccountHolderName('')
      setProcessingFee(0)
      setAdminNotes('')
      setNotifyCustomer(true)
    }
  }, [order])

  // Calculate net refund amount
  useEffect(() => {
    const refund = parseFloat(refundAmount) || 0
    const fee = parseFloat(processingFee) || 0
    setNetRefundAmount(Math.max(0, refund - fee))
  }, [refundAmount, processingFee])

  const handleRefundMethodChange = (method) => {
    setRefundMethod(method)
    // Reset method-specific fields
    setGcashNumber('')
    setBankName('')
    setAccountNumber('')
    setAccountHolderName('')
    
    // Set default processing fees
    switch (method) {
      case 'gcash':
        setProcessingFee(0)
        break
      case 'bank':
        setProcessingFee(25)
        break
      case 'cash':
        setProcessingFee(0)
        break
      case 'credit':
        setProcessingFee(0)
        break
      default:
        setProcessingFee(0)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!refundReason) {
      alert('Please select a refund reason')
      return
    }

    if (refundReason === 'other' && !customReason.trim()) {
      alert('Please specify the custom reason')
      return
    }

    if (!refundMethod) {
      alert('Please select a refund method')
      return
    }

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert('Please enter a valid refund amount')
      return
    }

    // Method-specific validation
    if (refundMethod === 'gcash' && !gcashNumber) {
      alert('Please enter GCash number')
      return
    }

    if (refundMethod === 'bank' && (!bankName || !accountNumber || !accountHolderName)) {
      alert('Please fill in all bank details')
      return
    }

    const refundData = {
      id: orderId,
      reason: refundReason === 'other' ? customReason : refundReason,
      method: refundMethod,
      originalAmount: parseFloat(originalAmount),
      refundAmount: parseFloat(refundAmount),
      processingFee: parseFloat(processingFee),
      netRefundAmount: netRefundAmount,
      
      // Payment method details
      paymentDetails: {
        gcashNumber: refundMethod === 'gcash' ? gcashNumber : null,
        bankName: refundMethod === 'bank' ? bankName : null,
        accountNumber: refundMethod === 'bank' ? accountNumber : null,
        accountHolderName: refundMethod === 'bank' ? accountHolderName : null
      },
      
      adminNotes,
      notifyCustomer,
      processedAt: new Date().toISOString(),
      processedBy: 'admin' // This would be the current admin user
    }

    onProcessRefund(orderId, refundData)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setOrderId('')
    setCustomerName('')
    setOriginalAmount('')
    setRefundAmount('')
    setRefundMethod('')
    setRefundReason('')
    setCustomReason('')
    setGcashNumber('')
    setBankName('')
    setAccountNumber('')
    setAccountHolderName('')
    setProcessingFee(0)
    setNetRefundAmount(0)
    setAdminNotes('')
    setNotifyCustomer(true)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">
              <i className="bi bi-arrow-clockwise me-2"></i>
              Process Refund
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="refundOrderId" className="form-label">Order ID</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="refundOrderId"
                    value={orderId}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="refundCustomerName" className="form-label">Customer Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="refundCustomerName"
                    value={customerName}
                    readOnly
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="originalAmount" className="form-label">Original Amount</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="originalAmount"
                    value={`₱${originalAmount}`}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="refundAmountInput" className="form-label">Refund Amount *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="refundAmountInput"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    max={originalAmount}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="refundReasonSelect" className="form-label">Refund Reason *</label>
                <select 
                  className="form-select" 
                  id="refundReasonSelect"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  {refundReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {refundReason === 'other' && (
                <div className="mb-3">
                  <label htmlFor="customReasonInput" className="form-label">Custom Reason *</label>
                  <textarea 
                    className="form-control" 
                    id="customReasonInput" 
                    rows="3"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please specify the reason for refund..."
                    required
                  ></textarea>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="refundMethodSelect" className="form-label">Refund Method *</label>
                <select 
                  className="form-select" 
                  id="refundMethodSelect"
                  value={refundMethod}
                  onChange={(e) => handleRefundMethodChange(e.target.value)}
                  required
                >
                  <option value="">Select Method</option>
                  <option value="gcash">GCash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash Refund</option>
                  <option value="credit">Store Credit</option>
                </select>
              </div>

              {/* Method-specific fields */}
              
              {refundMethod === 'gcash' && (
                <div className="mb-3">
                  <label htmlFor="gcashNumberInput" className="form-label">GCash Number *</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="gcashNumberInput"
                    value={gcashNumber}
                    onChange={(e) => setGcashNumber(e.target.value)}
                    placeholder="09XXXXXXXXX"
                    required
                  />
                </div>
              )}

              {refundMethod === 'bank' && (
                <>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="bankNameInput" className="form-label">Bank Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="bankNameInput"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g., BPI, BDO, Metrobank"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="accountNumberInput" className="form-label">Account Number *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="accountNumberInput"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="accountHolderInput" className="form-label">Account Holder Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="accountHolderInput"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Full name as registered in bank"
                      required
                    />
                  </div>
                </>
              )}

              {refundMethod === 'cash' && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Cash refund will be processed at the store location. Customer will be contacted for pickup.
                </div>
              )}

              {refundMethod === 'credit' && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Store credit will be added to customer's account and can be used for future purchases.
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="processingFeeInput" className="form-label">Processing Fee</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="processingFeeInput"
                    value={processingFee}
                    onChange={(e) => setProcessingFee(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="netRefundAmountInput" className="form-label">Net Refund Amount</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="netRefundAmountInput"
                    value={`₱${netRefundAmount.toFixed(2)}`}
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="notifyCustomerRefund"
                    checked={notifyCustomer}
                    onChange={(e) => setNotifyCustomer(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="notifyCustomerRefund">
                    Notify customer about refund processing
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="adminNotesInput" className="form-label">Admin Notes</label>
                <textarea 
                  className="form-control" 
                  id="adminNotesInput" 
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this refund..."
                ></textarea>
              </div>

              {/* Refund Summary */}
              <div className="bg-light p-3 rounded">
                <h6>Refund Summary</h6>
                <div className="d-flex justify-content-between">
                  <span>Refund Amount:</span>
                  <span>₱{parseFloat(refundAmount || 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Processing Fee:</span>
                  <span>-₱{parseFloat(processingFee || 0).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Net Refund:</span>
                  <span>₱{netRefundAmount.toFixed(2)}</span>
                </div>
                <small className="text-muted d-block mt-2">
                  Refund will be processed within 3-5 business days
                </small>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning" onClick={handleSubmit}>
              <i className="bi bi-check-circle me-1"></i>
              Process Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessRefundModal