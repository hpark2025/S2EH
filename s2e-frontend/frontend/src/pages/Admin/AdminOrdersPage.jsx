import { useState, useMemo } from 'react'
import { 
  EditOrderModal, 
  ViewOrderModal, 
  UpdateStatusModal, 
  CancelOrderModal, 
  ProcessRefundModal 
} from '../../components/AdminModals/AdminOrdersPage'
import usePagination from '../../components/Pagination'

// Import for Excel export
import * as XLSX from 'xlsx'
// Import for PDF export 
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Export utility functions
const exportToExcel = (data, filename = 'orders') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer.name,
      'Customer Phone': order.customer.phone,
      'Main Product': order.products.main,
      'Additional Items': order.products.additional,
      'Amount': `₱${order.amount}`,
      'Status': order.status,
      'Payment': order.payment,
      'Date': order.date,
      'Delivery Type': order.deliveryType
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    alert('Excel file downloaded successfully!')
  } catch (error) {
    console.error('Excel export error:', error)
    alert('Failed to export Excel file')
  }
}

const exportToCSV = (data, filename = 'orders') => {
  try {
    const csvData = data.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer.name,
      'Customer Phone': order.customer.phone,
      'Main Product': order.products.main,
      'Additional Items': order.products.additional,
      'Amount': `₱${order.amount}`,
      'Status': order.status,
      'Payment': order.payment,
      'Date': order.date,
      'Delivery Type': order.deliveryType
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert('CSV file downloaded successfully!')
  } catch (error) {
    console.error('CSV export error:', error)
    alert('Failed to export CSV file')
  }
}

const exportToPDF = (data, filename = 'orders') => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Orders Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32)
    
    // Prepare table data
    const tableData = data.map(order => [
      order.id,
      order.customer.name,
      order.products.main,
      `₱${order.amount}`,
      order.status,
      order.payment,
      order.date
    ])
    
    // Add table using autoTable
    if (doc.autoTable) {
      doc.autoTable({
        head: [['Order ID', 'Customer', 'Main Product', 'Amount', 'Status', 'Payment', 'Date']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [44, 133, 63] },
        margin: { top: 40 }
      })
    } else {
      // Fallback if autoTable is not available
      let yPosition = 50
      doc.setFontSize(8)
      
      // Add header
      const headers = ['Order ID', 'Customer', 'Main Product', 'Amount', 'Status', 'Payment', 'Date']
      let xPosition = 14
      headers.forEach(header => {
        doc.text(header, xPosition, yPosition)
        xPosition += 27
      })
      
      yPosition += 10
      
      // Add data rows
      tableData.forEach(row => {
        xPosition = 14
        row.forEach(cell => {
          doc.text(String(cell), xPosition, yPosition)
          xPosition += 27
        })
        yPosition += 8
        
        // Add new page if needed
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
      })
    }
    
    doc.save(`${filename}.pdf`)
    alert('PDF file downloaded successfully!')
  } catch (error) {
    console.error('PDF export error:', error)
    alert('Failed to export PDF file. Error: ' + error.message)
  }
}

const copyToClipboard = (data) => {
  try {
    const tableText = data.map(order => 
      `${order.id}\t${order.customer.name}\t${order.products.main}\t₱${order.amount}\t${order.status}\t${order.payment}\t${order.date}`
    ).join('\n')
    
    const header = 'Order ID\tCustomer\tMain Product\tAmount\tStatus\tPayment\tDate\n'
    const fullText = header + tableText
    
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Table data copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy: ', err)
      alert('Failed to copy data to clipboard')
    })
  } catch (error) {
    console.error('Copy to clipboard error:', error)
    alert('Failed to copy data to clipboard')
  }
}

const printTable = (data) => {
  try {
    const printWindow = window.open('', '_blank')
    const tableRows = data.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer.name}</td>
        <td>${order.products.main}</td>
        <td>₱${order.amount}</td>
        <td>${order.status}</td>
        <td>${order.payment}</td>
        <td>${order.date}</td>
      </tr>
    `).join('')
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2c853f; margin-bottom: 10px; }
          .timestamp { color: #666; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #2c853f; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          @media print {
            body { margin: 0; }
            table { font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>Orders Report</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Main Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  } catch (error) {
    console.error('Print error:', error)
    alert('Failed to print table')
  }
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [orders] = useState([])

  const [showEditModal, setShowEditModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.main.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
      
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, selectedStatus])

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    }
  }, [orders])

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0)

  // Use pagination hook
  const { currentItems: paginatedOrders, pagination } = usePagination({ 
    data: filteredOrders,
    itemsPerPageOptions: [5, 10, 15, 25],
    defaultItemsPerPage: 3 // Reduced to make pagination visible
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-active'
      case 'processing': return 'status-pending'
      case 'shipped': return 'status-info'
      case 'pending': return 'status-warning'
      case 'cancelled': return 'status-danger'
      default: return 'status-secondary'
    }
  }

  const getPaymentBadgeClass = (payment) => {
    switch (payment) {
      case 'paid': return 'status-active'
      case 'pending': return 'status-warning'
      case 'refunded': return 'status-info'
      default: return 'status-secondary'
    }
  }

  const handleEditOrder = (order) => {
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  const handleCancelOrder = (order) => {
    setSelectedOrder(order)
    setShowCancelModal(true)
  }

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order)
    setShowUpdateStatusModal(true)
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  const handleRefundOrder = (order) => {
    setSelectedOrder(order)
    setShowRefundModal(true)
  }

  const handleTrackOrder = (order) => {
    // Handle order tracking functionality
    console.log('Track order:', order.id)
  }

  const handleConfirmPayment = (order) => {
    // Handle payment confirmation
    console.log('Confirm payment for order:', order.id)
  }

  const TabButton = ({ status, icon, label, count, isActive, onClick }) => (
    <button 
      className={`tab-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '18px 24px',
        border: 'none',
        background: 'transparent',
        color: isActive ? 'var(--primary-color)' : 'var(--secondary-color)',
        fontWeight: '600',
        fontSize: '14px',
        borderBottom: isActive ? '4px solid var(--primary-color)' : '4px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center'
      }}
    >
      <i className={icon} style={{ marginRight: '8px', fontSize: '16px' }}></i>
      {label} (<span>{count}</span>)
    </button>
  )

  const ActionButton = ({ onClick, variant, icon, children, title }) => {
    const variants = {
      primary: {
        background: 'var(--primary-color)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(44, 133, 63, 0.3)',
        hoverBackground: '#236e33',
        hoverBoxShadow: '0 4px 12px rgba(44, 133, 63, 0.4)'
      },
      danger: {
        background: 'var(--highlight-color)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(228, 76, 49, 0.3)',
        hoverBackground: '#c13d26',
        hoverBoxShadow: '0 4px 12px rgba(228, 76, 49, 0.4)'
      },
      warning: {
        background: '#ffc107',
        color: '#000',
        boxShadow: '0 2px 6px rgba(255, 193, 7, 0.3)',
        hoverBackground: '#e0a800',
        hoverBoxShadow: '0 4px 10px rgba(255, 193, 7, 0.4)'
      },
      info: {
        background: '#17a2b8',
        color: 'white',
        boxShadow: '0 2px 6px rgba(23, 162, 184, 0.3)',
        hoverBackground: '#138496',
        hoverBoxShadow: '0 4px 10px rgba(23, 162, 184, 0.4)'
      },
      outline: {
        background: 'transparent',
        color: 'var(--secondary-color)',
        border: '1px solid var(--admin-border)',
        hoverBackground: 'var(--light-color)'
      }
    }

    const style = variants[variant] || variants.outline

    return (
      <button
        className="btn-admin"
        onClick={onClick}
        title={title}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: style.border || 'none',
          background: style.background,
          color: style.color,
          boxShadow: style.boxShadow || 'none',
          fontWeight: variant === 'primary' || variant === 'danger' ? 600 : 'normal',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          fontSize: '12px',
          minWidth: '70px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap'
        }}
        onMouseOver={(e) => {
          if (style.hoverBackground) e.target.style.backgroundColor = style.hoverBackground
          if (style.hoverBoxShadow) e.target.style.boxShadow = style.hoverBoxShadow
          e.target.style.transform = 'scale(1.05)'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = style.background
          if (style.boxShadow) e.target.style.boxShadow = style.boxShadow
          e.target.style.transform = 'scale(1)'
        }}
      >
        <i className={icon}></i>
        <span style={{ marginLeft: '4px' }}>{children}</span>
      </button>
    )
  }

  return (
    <>
      {/* Order Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Orders</div>
            <div className="stat-icon">
              <i className="bi bi-cart3"></i>
            </div>
          </div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-change positive">All orders placed</div>
        </div>
        
        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-title">Pending Orders</div>
            <div className="stat-icon">
              <i className="bi bi-clock"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.pending}</div>
          <div className="stat-change positive">Awaiting processing</div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-header">
            <div className="stat-title">Completed Orders</div>
            <div className="stat-icon">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.completed}</div>
          <div className="stat-change positive">Successfully completed</div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-header">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-icon">
              <i className="bi bi-currency-peso"></i>
            </div>
          </div>
          <div className="stat-value">₱{totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">Generated revenue</div>
        </div>
      </div>

      {/* Orders Management */}
      <div className="admin-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div id="datatableButtons" className="d-flex gap-2">
              {/* DataTables export buttons */}
              <button 
                className="btn btn-primary"
                onClick={() => copyToClipboard(filteredOrders)}
                title="Copy table data to clipboard"
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
              <button 
                className="btn btn-success"
                onClick={() => exportToExcel(filteredOrders, 'orders_report')}
                title="Export to Excel"
              >
                <i className="bi bi-file-earmark-excel"></i> Excel
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => exportToCSV(filteredOrders, 'orders_report')}
                title="Export to CSV"
              >
                <i className="bi bi-file-earmark-text"></i> CSV
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => exportToPDF(filteredOrders, 'orders_report')}
                title="Export to PDF"
              >
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </button>
              <button 
                className="btn btn-info"
                onClick={() => printTable(filteredOrders)}
                title="Print table"
              >
                <i className="bi bi-printer"></i> Print
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search orders..."
                style={{ width: '250px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Order Status Tabs */}
        <div className="order-tabs" style={{ margin: 0, borderBottom: '1px solid var(--admin-border)', background: 'white' }}>
          <div className="tab-navigation" style={{ display: 'flex', gap: 0, width: '100%' }}>
            <TabButton 
              status="all" 
              icon="bi-grid" 
              label="All Orders" 
              count={statusCounts.all}
              isActive={selectedStatus === 'all'}
              onClick={() => setSelectedStatus('all')}
            />
            <TabButton 
              status="pending" 
              icon="bi-clock" 
              label="Pending" 
              count={statusCounts.pending}
              isActive={selectedStatus === 'pending'}
              onClick={() => setSelectedStatus('pending')}
            />
            <TabButton 
              status="processing" 
              icon="bi-gear" 
              label="Processing" 
              count={statusCounts.processing}
              isActive={selectedStatus === 'processing'}
              onClick={() => setSelectedStatus('processing')}
            />
            <TabButton 
              status="shipped" 
              icon="bi-truck" 
              label="Shipped" 
              count={statusCounts.shipped}
              isActive={selectedStatus === 'shipped'}
              onClick={() => setSelectedStatus('shipped')}
            />
            <TabButton 
              status="completed" 
              icon="bi-check-circle" 
              label="Completed" 
              count={statusCounts.completed}
              isActive={selectedStatus === 'completed'}
              onClick={() => setSelectedStatus('completed')}
            />
            <TabButton 
              status="cancelled" 
              icon="bi-x-circle" 
              label="Cancelled" 
              count={statusCounts.cancelled}
              isActive={selectedStatus === 'cancelled'}
              onClick={() => setSelectedStatus('cancelled')}
            />
          </div>
        </div>

        <div className="card-body">
          <table className="admin-table table table-striped table-hover" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr 
                  key={order.id}
                  style={{ cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <td>
                    <div style={{ fontWeight: '500' }}>#{order.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>{order.deliveryType}</div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{order.customer.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>{order.customer.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{order.products.main}</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>{order.products.additional}</div>
                    </div>
                  </td>
                  <td>₱{order.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getPaymentBadgeClass(order.payment)}`}>
                      {order.payment.charAt(0).toUpperCase() + order.payment.slice(1)}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: '200px'
                    }}>
                      {/* Completed orders actions */}
                      {order.status === 'completed' && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Edit Order"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditOrder(order)
                            }}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            icon="bi bi-trash"
                            title="Delete Order"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelOrder(order)
                            }}
                          >
                            Delete
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Processing orders actions */}
                      {order.status === 'processing' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-arrow-up-circle"
                            title="Update Order Status"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateStatus(order)
                            }}
                          >
                            Update
                          </ActionButton>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-eye"
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewOrder(order)
                            }}
                          >
                            View
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Shipped orders actions */}
                      {order.status === 'shipped' && (
                        <>
                          <ActionButton
                            variant="info"
                            icon="bi bi-geo-alt"
                            title="Track Package"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTrackOrder(order)
                            }}
                          >
                            Track
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Pending orders actions */}
                      {order.status === 'pending' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-check-circle"
                            title="Confirm Payment"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConfirmPayment(order)
                            }}
                          >
                            Confirm
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Cancelled orders actions */}
                      {order.status === 'cancelled' && (
                        <>
                          <ActionButton
                            variant="warning"
                            icon="bi bi-arrow-clockwise"
                            title="Process Refund"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRefundOrder(order)
                            }}
                          >
                            Refund
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedOrders.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--secondary-color)' 
            }}>
              <i className="bi bi-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p>No orders found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination}
      </div>

      {/* Order Modals */}
      <EditOrderModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={(orderId, orderData) => {
          console.log('Editing order:', orderId, orderData)
          // Handle order edit logic here
        }}
        order={selectedOrder}
      />

      <ViewOrderModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        order={selectedOrder}
      />

      <UpdateStatusModal
        show={showUpdateStatusModal}
        onClose={() => setShowUpdateStatusModal(false)}
        onUpdate={(orderId, updateData) => {
          console.log('Updating order status:', orderId, updateData)
          // Handle status update logic here
        }}
        order={selectedOrder}
      />

      <CancelOrderModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCancel={(orderId, cancellationData) => {
          console.log('Cancelling order:', orderId, cancellationData)
          // Handle order cancellation logic here
        }}
        order={selectedOrder}
      />

      <ProcessRefundModal
        show={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onProcessRefund={(orderId, refundData) => {
          console.log('Processing refund:', orderId, refundData)
          // Handle refund processing logic here
        }}
        order={selectedOrder}
      />
    </>
  )
}


