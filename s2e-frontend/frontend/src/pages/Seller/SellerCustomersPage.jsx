import { useState, useEffect, useMemo } from 'react'
import DataExport from '../../utils/DataExport'
import { sellerAPI } from '../../services/sellerAPI'
import {
  ViewCustomerModal,
  MessageCustomerModal,
  OrderHistoryModal,
  SendMessageModal,
  CreatePromotionModal,
  CustomerSegmentModal,
  LoyaltyProgramModal
} from '../../components/SellerModals'

const SellerCustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false)
  const [showSendMessageModal, setShowSendMessageModal] = useState(false)
  const [showCreatePromotionModal, setShowCreatePromotionModal] = useState(false)
  const [showCustomerSegmentModal, setShowCustomerSegmentModal] = useState(false)
  const [showLoyaltyProgramModal, setShowLoyaltyProgramModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Load customers from backend
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        const response = await sellerAPI.getCustomers()
        const customersData = response.data?.customers || response.customers || []
        setCustomers(customersData)
      } catch (error) {
        console.error('Failed to load customers:', error)
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  // Filter customers based on active tab and search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return customers.filter(customer => {
        return activeTab === 'all' || customer.status === activeTab
      })
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    return customers.filter(customer => {
      const matchesTab = activeTab === 'all' || customer.status === activeTab
      const matchesSearch = 
        (customer.name || '').toLowerCase().includes(searchLower) ||
        (customer.email || '').toLowerCase().includes(searchLower) ||
        (customer.phone || '').toString().includes(searchLower)
      return matchesTab && matchesSearch
    })
  }, [customers, searchTerm, activeTab])

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  // Generate page numbers (show max 3 page numbers around current page)
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show current page and 1 page before/after
      if (currentPage === 1) {
        pages.push(1, 2, 3)
      } else if (currentPage === totalPages) {
        pages.push(totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1)
      }
    }
    return pages
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Calculate stats
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active' || c.status === 'repeat' || c.status === 'vip').length
  const repeatCustomers = customers.filter(c => c.status === 'repeat' || c.status === 'vip').length
  const vipCustomers = customers.filter(c => c.status === 'vip').length
  const inactiveCustomers = customers.filter(c => c.status === 'inactive').length
  const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)
  const avgOrderValue = totalOrders > 0 
    ? customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / totalOrders 
    : 0

  // Export handlers
  const handleExport = (format) => {
    const exportData = filteredCustomers.map(customer => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      lastOrder: customer.lastOrder,
      status: customer.status,
      rating: customer.rating
    }))

    const headers = ['Customer Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Last Order', 'Status', 'Rating']
    
    switch(format) {
      case 'copy':
        DataExport.copyToClipboard(exportData, headers)
        break
      case 'excel':
        DataExport.exportExcel(exportData, 'customers_report', headers)
        break
      case 'csv':
        DataExport.exportCSV(exportData, 'customers_report', headers)
        break
      case 'pdf':
        DataExport.exportPDF(exportData, 'Customers Report', headers, {
          title: 'Customers Report',
          companyName: 'Sagnay to Everyone Hub'
        })
        break
      case 'print':
        DataExport.print(exportData, headers, 'Customers Report')
        break
    }
  }

  const getStatusBadgeClass = (status) => {
    return {
      'active': 'active',
      'repeat': 'repeat',
      'vip': 'vip',
      'inactive': 'inactive'
    }[status] || 'active'
  }

  const formatStatus = (status) => {
    return {
      'active': 'Active',
      'repeat': 'Repeat Customer',
      'vip': 'VIP Customer',
      'inactive': 'Inactive'
    }[status] || 'Active'
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half text-warning"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="bi bi-star text-muted"></i>
        ))}
      </>
    )
  }

  // Modal handlers
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowViewModal(true)
  }

  const handleMessageCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowMessageModal(true)
  }

  const handleOrderHistory = (customer) => {
    setSelectedCustomer(customer)
    setShowOrderHistoryModal(true)
  }

  return (
    <div className="seller-content p-4">
      {/* Customer Stats - Matching the HTML design */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Total Customers</h6>
                  <h2 className="mb-0">{totalCustomers}</h2>
                  <small className="opacity-75">No new customers</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-people fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Active Customers</h6>
                  <h2 className="mb-0">{activeCustomers}</h2>
                  <small className="opacity-75">No active customers</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-person-check fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Repeat Customers</h6>
                  <h2 className="mb-0">{repeatCustomers}</h2>
                  <small className="opacity-75">No retention data</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-arrow-repeat fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Avg. Order Value</h6>
                  <h2 className="mb-0">₱{Math.round(avgOrderValue).toLocaleString()}</h2>
                  <small className="opacity-75">No revenue change</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-cash-coin fs-1 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Management */}
      <div className="seller-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex gap-2">
              <button 
                className="btn btn-secondary btn-sm d-flex align-items-center gap-1" 
                onClick={() => handleExport('copy')}
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
              <button 
                className="btn btn-success btn-sm d-flex align-items-center gap-1"
                onClick={() => handleExport('excel')}
              >
                <i className="bi bi-file-earmark-excel"></i> Excel
              </button>
              <button 
                className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                onClick={() => handleExport('csv')}
              >
                <i className="bi bi-file-earmark-text"></i> CSV
              </button>
              <button 
                className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                onClick={() => handleExport('pdf')}
              >
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </button>
              <button 
                className="btn btn-info btn-sm d-flex align-items-center gap-1"
                onClick={() => handleExport('print')}
              >
                <i className="bi bi-printer"></i> Print
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{width: '250px'}}
              />
              <button 
                className="btn-seller d-flex align-items-center gap-2" 
                onClick={() => setShowSendMessageModal(true)}
              >
                <i className="bi bi-envelope"></i>
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Customer Status Tabs */}
        <div className="user-tabs" style={{margin: 0, borderBottom: '1px solid var(--admin-border)', background: 'white'}}>
          <div className="tab-navigation" style={{display: 'flex', gap: 0, width: '100%'}}>
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1, 
                padding: '18px 24px', 
                border: 'none', 
                background: 'transparent', 
                color: activeTab === 'all' ? '#2c855f' : '#666',
                fontWeight: 600, 
                fontSize: '14px', 
                borderBottom: activeTab === 'all' ? '4px solid #2c855f' : '4px solid transparent',
                cursor: 'pointer', 
                transition: 'all 0.3s ease', 
                textAlign: 'center'
              }}
            >
              <i className="bi bi-people" style={{marginRight: '8px', fontSize: '16px'}}></i>
              All Customers ({totalCustomers})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
              style={{
                flex: 1, 
                padding: '18px 24px', 
                border: 'none', 
                background: 'transparent', 
                color: activeTab === 'active' ? '#2c855f' : '#666',
                fontWeight: 600, 
                fontSize: '14px', 
                borderBottom: activeTab === 'active' ? '4px solid #2c855f' : '4px solid transparent',
                cursor: 'pointer', 
                transition: 'all 0.3s ease', 
                textAlign: 'center'
              }}
            >
              <i className="bi bi-person-check" style={{marginRight: '8px', fontSize: '16px'}}></i>
              Active ({activeCustomers})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'repeat' ? 'active' : ''}`}
              onClick={() => setActiveTab('repeat')}
              style={{
                flex: 1, 
                padding: '18px 24px', 
                border: 'none', 
                background: 'transparent', 
                color: activeTab === 'repeat' ? '#2c855f' : '#666',
                fontWeight: 600, 
                fontSize: '14px', 
                borderBottom: activeTab === 'repeat' ? '4px solid #2c855f' : '4px solid transparent',
                cursor: 'pointer', 
                transition: 'all 0.3s ease', 
                textAlign: 'center'
              }}
            >
              <i className="bi bi-arrow-repeat" style={{marginRight: '8px', fontSize: '16px'}}></i>
              Repeat ({repeatCustomers})
            </button>
          </div>
        </div>

        <div className="card-body" style={{padding: 0}}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people fs-1 text-muted"></i>
              <p className="mt-3 text-muted">No customers found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table table table-striped table-hover" style={{width:'100%'}}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                    <th>Status</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} data-status={customer.status}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="customer-avatar me-2">{customer.initials}</div>
                        <div>
                          <h6 className="mb-0">{customer.name}</h6>
                          <small className="text-muted">Customer since {customer.customerSince}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{customer.email}</div>
                        <small className="text-muted">{customer.phone}</small>
                      </div>
                    </td>
                    <td><strong>{customer.totalOrders || 0}</strong></td>
                    <td><strong>₱{(customer.totalSpent || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></td>
                    <td>{customer.lastOrder || 'No orders yet'}</td>
                    <td><span className={`status-badge ${getStatusBadgeClass(customer.status || 'active')}`}>{formatStatus(customer.status || 'active')}</span></td>
                    <td>
                      <div className="rating">
                        <div className="stars">
                          {customer.rating > 0 ? renderStars(customer.rating) : <span className="text-muted">No rating</span>}
                        </div>
                        {customer.rating > 0 && (
                          <small className="text-muted">{customer.rating.toFixed(1)} ({customer.ratingCount || 0})</small>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Custom Pagination - Only show when not loading and has customers */}
          {!loading && filteredCustomers.length > 0 && totalPages > 1 && (
          <div className="pagination-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0', borderTop: '1px solid #e0e0e0'}}>
            <nav aria-label="Table pagination">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    aria-label="Previous"
                    style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                </li>
                {getPageNumbers().map((pageNum) => (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(pageNum)}
                      style={{ cursor: 'pointer' }}
                    >
                      {pageNum}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    aria-label="Next"
                    style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
            <div className="ms-3 text-muted" style={{ fontSize: '14px' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
          </div>
          )}
        </div>
      </div>

      <style>{`
        .seller-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
          border-radius: 12px 12px 0 0;
        }

        .card-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }

        .card-body {
          padding: 24px;
        }

        .btn-seller {
          background-color: #2e7d32;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-seller:hover {
          background-color: #1b5e20;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
        }

        .btn-seller-outline {
          background-color: transparent;
          color: #2e7d32;
          border: 2px solid #2e7d32;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-seller-outline:hover {
          background-color: #2e7d32;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
        }

        .admin-table {
          font-size: 14px;
          border-collapse: collapse;
          margin: 0;
        }

        .admin-table th {
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          color: #495057;
          font-weight: 600;
          padding: 12px 16px;
          text-align: left;
          border-top: none;
        }

        .admin-table td {
          padding: 12px 16px;
          vertical-align: middle;
          border-top: 1px solid #e0e0e0;
        }

        .customer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2e7d32, #1b5e20);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-badge.repeat {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status-badge.vip {
          background: #fff3e0;
          color: #f57c00;
        }

        .status-badge.inactive {
          background: #ffebee;
          color: #d32f2f;
        }

        .rating .stars {
          font-size: 14px;
          margin-bottom: 2px;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
          justify-content: center;
        }

        .action-buttons .btn {
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .action-buttons .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .admin-table th,
          .admin-table td {
            padding: 8px 12px;
            font-size: 13px;
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 3px;
          }
          
          .action-buttons .btn {
            font-size: 10px;
            padding: 2px 6px;
          }
        }
      `}</style>

      {/* Customer Modals */}
      <ViewCustomerModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        customer={selectedCustomer}
      />

      <MessageCustomerModal
        show={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        customer={selectedCustomer}
      />

      <OrderHistoryModal
        show={showOrderHistoryModal}
        onClose={() => setShowOrderHistoryModal(false)}
        customer={selectedCustomer}
      />

      <SendMessageModal
        show={showSendMessageModal}
        onClose={() => setShowSendMessageModal(false)}
      />

      <CreatePromotionModal
        show={showCreatePromotionModal}
        onClose={() => setShowCreatePromotionModal(false)}
      />

      <CustomerSegmentModal
        show={showCustomerSegmentModal}
        onClose={() => setShowCustomerSegmentModal(false)}
      />

      <LoyaltyProgramModal
        show={showLoyaltyProgramModal}
        onClose={() => setShowLoyaltyProgramModal(false)}
      />
    </div>
  )
}

export default SellerCustomersPage