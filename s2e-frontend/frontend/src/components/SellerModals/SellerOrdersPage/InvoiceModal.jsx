import { useState, useRef } from 'react'
import PropTypes from 'prop-types'

export default function InvoiceModal({ show, onClose, order }) {
  const [generating, setGenerating] = useState(false)
  const invoiceRef = useRef()

  if (!show || !order) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const orderNum = order.id.replace('#ORD-', '').replace(/-/g, '')
    return `INV-${year}${month}-${orderNum}`
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    setGenerating(true)
    try {
      // In a real application, you would use a library like jsPDF or html2canvas
      // For now, we'll simulate the download process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a simple text version for demonstration
      const invoiceText = `
INVOICE

Invoice Number: ${generateInvoiceNumber()}
Date: ${formatDate(new Date())}

Bill To:
${order.customer?.name || order.customer}
${order.shippingAddress?.street || ''}
${order.shippingAddress?.barangay || ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''}

Order Details:
Order ID: ${order.id}
Order Date: ${formatDate(order.date)}
Payment Method: ${order.paymentMethod || 'Cash on Delivery'}

Items:
${order.items?.map(item => `${item.name} - Qty: ${item.quantity} - ${formatCurrency(item.price)}`).join('\n') || 'No items'}

Total: ${formatCurrency(order.total)}
      `
      
      const blob = new Blob([invoiceText], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${generateInvoiceNumber()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error generating invoice:', error)
    } finally {
      setGenerating(false)
    }
  }

  const calculateSubtotal = () => {
    return order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
  }

  const taxRate = 0.12 // 12% VAT in Philippines
  const subtotal = calculateSubtotal()
  const taxAmount = subtotal * taxRate
  const discountAmount = order.discount || 0
  const shippingFee = order.shippingFee || 0

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-receipt me-2"></i>
              Order Invoice
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Invoice for order #{order.id}. You can print or download this invoice for your records.
            </div>

            <div ref={invoiceRef} className="invoice-content">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-success">From Sagnay to Every Home</h6>
                  <p className="text-muted small mb-1">Local Agricultural Marketplace</p>
                  <p className="small mb-0">
                    Sagnay, Camarines Sur, Philippines<br/>
                    Email: info@s2eh.com
                  </p>
                </div>
                <div className="col-md-6 text-end">
                  <h5 className="text-success">INVOICE</h5>
                  <p className="mb-1"><strong>Invoice #:</strong> {generateInvoiceNumber()}</p>
                  <p className="mb-1"><strong>Date:</strong> {formatDate(new Date())}</p>
                  <p className="mb-1"><strong>Order #:</strong> {order.id}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Bill To:</label>
                  <div className="mb-2">
                    <strong>{order.customer?.name || order.customer}</strong>
                  </div>
                  {order.shippingAddress && (
                    <div className="small">
                      {order.shippingAddress.street}<br/>
                      {order.shippingAddress.barangay}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.province}<br/>
                      <strong>Phone:</strong> {order.shippingAddress.phone}
                    </div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Order Information:</label>
                  <div className="mb-1">
                    <strong>Order Date:</strong> {formatDate(order.date)}
                  </div>
                  <div className="mb-1">
                    <strong>Payment:</strong> {order.paymentMethod || 'Cash on Delivery'}
                  </div>
                  <div className="mb-1">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${
                      order.status === 'pending' ? 'bg-warning text-dark' :
                      order.status === 'processing' ? 'bg-info' :
                      order.status === 'shipped' ? 'bg-primary' :
                      order.status === 'delivered' ? 'bg-success' : 'bg-secondary'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Order Items:</label>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, index) => {
                        const itemTotal = item.price * item.quantity
                        return (
                          <tr key={index}>
                            <td>
                              <div className="fw-medium">{item.name}</div>
                              {item.variant && (
                                <small className="text-muted">Variant: {item.variant}</small>
                              )}
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{formatCurrency(item.price)}</td>
                            <td className="text-end">{formatCurrency(itemTotal)}</td>
                          </tr>
                        )
                      }) || (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="row justify-content-end mb-3">
                <div className="col-md-5">
                  <div className="border p-3 rounded bg-light">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>VAT (12%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping Fee:</span>
                      <span>{formatCurrency(shippingFee)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <hr/>
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total Amount:</span>
                      <span className="text-success">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <p className="mb-1"><strong>Thank you for your business!</strong></p>
                <p className="text-muted small">Supporting local farmers and bringing fresh produce to your home</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>Close
            </button>
            <button 
              type="button" 
              className="btn btn-outline-primary" 
              onClick={handlePrint}
            >
              <i className="bi bi-printer me-2"></i>Print
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleDownload}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

InvoiceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    customer: PropTypes.string.isRequired,
    date: PropTypes.string,
    status: PropTypes.string,
    paymentStatus: PropTypes.string,
    paymentMethod: PropTypes.string,
    total: PropTypes.number.isRequired,
    discount: PropTypes.number,
    shippingFee: PropTypes.number,
    items: PropTypes.array,
    shippingAddress: PropTypes.object
  })
}