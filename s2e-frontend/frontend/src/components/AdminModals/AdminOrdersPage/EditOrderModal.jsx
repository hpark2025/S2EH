import { useState, useEffect } from 'react'

const EditOrderModal = ({ show, onClose, onEdit, order }) => {
  const [orderId, setOrderId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState([])

  // Sample products for dropdown
  const products = [
    { id: 'PROD001', name: 'Organic Tomatoes', price: 120 },
    { id: 'PROD002', name: 'Fresh Milkfish', price: 250 },
    { id: 'PROD003', name: 'Free-range Eggs', price: 180 },
    { id: 'PROD004', name: 'Organic Rice', price: 80 },
    { id: 'PROD005', name: 'Fresh Vegetables', price: 150 }
  ]

  // Populate form when order prop changes
  useEffect(() => {
    if (order) {
      setOrderId(order.id || '')
      setCustomerName(order.customer || '')
      setCustomerPhone(order.phone || '')
      setCustomerEmail(order.email || '')
      setDeliveryAddress(order.address || '')
      setOrderStatus(order.status || '')
      setPaymentStatus(order.payment || '')
      setPaymentMethod(order.paymentMethod || '')
      setTrackingNumber(order.trackingNumber || '')
      setNotes(order.notes || '')
      
      // Initialize order items based on products string
      if (order.products) {
        const items = [
          {
            id: 'PROD001',
            name: order.products.main || '',
            quantity: 2,
            price: 120,
            total: 240
          }
        ]
        setOrderItems(items)
      }
    }
  }, [order])

  const handleAddItem = () => {
    setOrderItems([...orderItems, {
      id: '',
      name: '',
      quantity: 1,
      price: 0,
      total: 0
    }])
  }

  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index)
      setOrderItems(newItems)
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems]
    newItems[index][field] = value

    // If product is selected, auto-fill name and price
    if (field === 'id') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].name = product.name
        newItems[index].price = product.price
        newItems[index].total = product.price * newItems[index].quantity
      }
    }

    // Recalculate total when quantity or price changes
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].price * newItems[index].quantity
    }

    setOrderItems(newItems)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert('Please fill in all required fields')
      return
    }

    const orderData = {
      id: orderId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      status: orderStatus,
      payment: paymentStatus,
      paymentMethod,
      trackingNumber,
      notes,
      items: orderItems,
      updatedAt: new Date().toISOString()
    }

    onEdit(orderId, orderData)
    onClose()
  }

  const resetForm = () => {
    setOrderId('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setDeliveryAddress('')
    setOrderStatus('')
    setPaymentStatus('')
    setPaymentMethod('')
    setTrackingNumber('')
    setNotes('')
    setOrderItems([])
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
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil text-warning me-2"></i>
              Edit Order
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <input type="hidden" value={orderId} />
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editCustomerName" className="form-label">Customer Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="editCustomerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editCustomerPhone" className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="editCustomerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editCustomerEmail" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="editCustomerEmail"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editPaymentMethod" className="form-label">Payment Method</label>
                    <select 
                      className="form-select" 
                      id="editPaymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">Select Payment Method</option>
                      <option value="cash">Cash on Delivery</option>
                      <option value="gcash">GCash</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editOrderStatus" className="form-label">Order Status</label>
                    <select 
                      className="form-select" 
                      id="editOrderStatus"
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editPaymentStatus" className="form-label">Payment Status</label>
                    <select 
                      className="form-select" 
                      id="editPaymentStatus"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <option value="">Select Payment Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="editDeliveryAddress" className="form-label">Delivery Address *</label>
                <textarea 
                  className="form-control" 
                  id="editDeliveryAddress" 
                  rows="3"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              {(orderStatus === 'shipped' || orderStatus === 'completed') && (
                <div className="mb-3">
                  <label htmlFor="editTrackingNumber" className="form-label">Tracking Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="editTrackingNumber"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Order Items</label>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select 
                              className="form-select form-select-sm"
                              value={item.id}
                              onChange={(e) => handleItemChange(index, 'id', e.target.value)}
                            >
                              <option value="">Select Product</option>
                              {products.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td>₱{item.price.toFixed(2)}</td>
                          <td>₱{item.total.toFixed(2)}</td>
                          <td>
                            <button 
                              type="button" 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRemoveItem(index)}
                              disabled={orderItems.length === 1}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleAddItem}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Add Item
                </button>
              </div>

              <div className="mb-3">
                <label htmlFor="editNotes" className="form-label">Notes</label>
                <textarea 
                  className="form-control" 
                  id="editNotes" 
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                ></textarea>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning" onClick={handleSubmit}>
              <i className="bi bi-check-circle me-1"></i>
              Update Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditOrderModal