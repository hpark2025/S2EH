import { useState, useMemo, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { adminAPI } from '../../services/adminAPI'
import {
  ApproveProductModal,
  RejectProductModal,
  RestockProductModal,
  DeleteProductModal,
  ArchiveProductModal,
  CategorizeProductModal,
  EditProductModal
} from '../../components/AdminModals'
import usePagination from '../../components/Pagination'

// Import for Excel export
import * as XLSX from 'xlsx'
// Import for PDF export 
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Export utility functions
const exportToExcel = (data, filename = 'products') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data.map(product => ({
      'Product ID': product.id,
      'Product Name': product.name,
      'Producer': product.producer,
      'Price': `₱${product.price}`,
      'Stock': `${product.stock} pcs`,
      'Status': product.status,
      'LGU Verified': product.lguVerified ? 'Verified' : 'Pending',
      'Description': product.description
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    alert('Excel file downloaded successfully!')
  } catch (error) {
    console.error('Excel export error:', error)
    alert('Failed to export Excel file')
  }
}

const exportToCSV = (data, filename = 'products') => {
  try {
    const csvData = data.map(product => ({
      'Product ID': product.id,
      'Product Name': product.name,
      'Producer': product.producer,
      'Price': `₱${product.price}`,
      'Stock': `${product.stock} pcs`,
      'Status': product.status,
      'LGU Verified': product.lguVerified ? 'Verified' : 'Pending',
      'Description': product.description
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

const exportToPDF = (data, filename = 'products') => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Products Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32)
    
    // Prepare table data
    const tableData = data.map(product => [
      product.id,
      product.name,
      product.producer,
      `₱${product.price}`,
      `${product.stock} pcs`,
      product.status,
      product.lguVerified ? 'Verified' : 'Pending'
    ])
    
    // Add table using autoTable
    if (doc.autoTable) {
      doc.autoTable({
        head: [['ID', 'Product Name', 'Producer', 'Price', 'Stock', 'Status', 'LGU Verified']],
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
      const headers = ['ID', 'Product Name', 'Producer', 'Price', 'Stock', 'Status', 'LGU Verified']
      let xPosition = 14
      headers.forEach(header => {
        doc.text(header, xPosition, yPosition)
        xPosition += 25
      })
      
      yPosition += 10
      
      // Add data rows
      tableData.forEach(row => {
        xPosition = 14
        row.forEach(cell => {
          doc.text(String(cell), xPosition, yPosition)
          xPosition += 25
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
    const tableText = data.map(product => 
      `${product.id}\t${product.name}\t${product.producer}\t₱${product.price}\t${product.stock} pcs\t${product.status}\t${product.lguVerified ? 'Verified' : 'Pending'}`
    ).join('\n')
    
    const header = 'Product ID\tProduct Name\tProducer\tPrice\tStock\tStatus\tLGU Verified\n'
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
    const tableRows = data.map(product => `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.producer}</td>
        <td>₱${product.price}</td>
        <td>${product.stock} pcs</td>
        <td>${product.status}</td>
        <td>${product.lguVerified ? 'Verified' : 'Pending'}</td>
      </tr>
    `).join('')
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Products Report</title>
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
        <h1>Products Report</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Producer</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>LGU Verified</th>
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

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all') // Show all products by default
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
  }, [selectedStatus])

  const fetchProducts = async () => {
    try {
      console.log('📡 Fetching products for admin...');
      setLoading(true)
      
      const response = await adminAPI.products.getAll({ 
        status: selectedStatus === 'all' ? null : selectedStatus
      })
      
      console.log('✅ Products response:', response);
      console.log('✅ response.data:', response.data);
      console.log('✅ response.data.products:', response.data?.products);
      
      const productsData = response.data?.products || response.products || [];
      console.log('✅ productsData:', productsData);
      
      // Transform backend data to frontend format
      const transformedProducts = productsData.map(product => ({
        id: product.id,
        name: product.title,
        producer: product.seller_name || 'Unknown',
        producerId: product.seller_id,
        category: product.category_name || 'Uncategorized',
        price: parseFloat(product.price),
        stock: product.stock_quantity,
        status: product.status,
        lguVerified: product.status === 'published',
        description: product.description || '',
        image: product.thumbnail 
          ? (product.thumbnail.startsWith('http') || product.thumbnail.startsWith('data:') 
              ? product.thumbnail 
              : `http://localhost:8080/S2EH/s2e-backend${product.thumbnail}`)
          : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E',
        sku: product.sku,
        createdAt: product.created_at
      }));
      
      console.log(`✅ Loaded ${transformedProducts.length} products`);
      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showCategorizeModal, setShowCategorizeModal] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      // If no search term, return all products filtered by status only
      return products.filter(product => {
        return selectedStatus === 'all' || product.status === selectedStatus
      })
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    return products.filter(product => {
      const matchesSearch = 
        String(product.id).includes(searchLower) ||
        (product.name || '').toLowerCase().includes(searchLower) ||
        (product.description || '').toLowerCase().includes(searchLower) ||
        (product.producer || '').toLowerCase().includes(searchLower) ||
        (product.category || '').toLowerCase().includes(searchLower)
      
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
      
      return matchesSearch && matchesStatus
    })
  }, [products, searchTerm, selectedStatus])

  const statusCounts = useMemo(() => {
    return {
      all: products.length,
      proposed: products.filter(p => p.status === 'proposed').length,
      published: products.filter(p => p.status === 'published').length,
      rejected: products.filter(p => p.status === 'rejected').length
    }
  }, [products])

  // Use pagination hook
  const { currentItems: paginatedProducts, pagination } = usePagination({ 
    data: filteredProducts,
    itemsPerPageOptions: [5, 10, 15, 25],
    defaultItemsPerPage: 5 // Increased to make it easier to see all products
  })

  // ActionButton component for consistent button styling
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

  const formatCurrency = (amount) => {
    return `₱${amount}`
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      'proposed': 'status-badge status-pending',
      'published': 'status-badge status-active',
      'rejected': 'status-badge status-danger',
      'draft': 'status-badge status-inactive'
    }
    
    const statusTexts = {
      'proposed': 'Proposed',
      'published': 'Published',
      'rejected': 'Rejected',
      'draft': 'Draft'
    }
    
    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {statusTexts[status] || status}
      </span>
    )
  }

  const getLguStatusBadge = (verified) => {
    return verified ? 
      <span className="status-badge status-active">Verified</span> :
      <span className="status-badge status-pending">Pending</span>
  }

  const closeAllModals = () => {
    setShowEditModal(false)
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowRestockModal(false)
    setShowDeleteModal(false)
    setShowArchiveModal(false)
    setShowCategorizeModal(false)
    setSelectedProduct(null)
  }

  const handleAction = (product, action) => {
    setSelectedProduct(product)
    switch(action) {
      case 'edit':
        setShowEditModal(true)
        break
      case 'categorize':
        setShowCategorizeModal(true)
        break
      case 'archive':
        setShowArchiveModal(true)
        break
      case 'restock':
        setShowRestockModal(true)
        break
      case 'delete':
        setShowDeleteModal(true)
        break
      case 'approve':
        setShowApproveModal(true)
        break
      case 'reject':
        setShowRejectModal(true)
        break
    }
  }

  // API handlers for publish/reject
  const confirmApproveProduct = async () => {
    try {
      await adminAPI.products.approve(selectedProduct.id)
      toast.success(`${selectedProduct.name} has been published and is now visible to customers`)
      closeAllModals()
      await fetchProducts()
    } catch (error) {
      console.error('Failed to publish product:', error)
      toast.error('Failed to publish product')
    }
  }

  const confirmRejectProduct = async () => {
    const reason = document.getElementById('rejectReasonProduct')?.value?.trim()
    try {
      await adminAPI.products.reject(selectedProduct.id, reason)
      toast.success(`${selectedProduct.name} has been rejected`)
      closeAllModals()
      await fetchProducts()
    } catch (error) {
      console.error('Failed to reject product:', error)
      toast.error('Failed to reject product')
    }
  }

  const handleRowClick = (productId) => {
    // Navigate to product details page
    console.log(`Navigate to product-details.html?id=${productId}`)
  }

  return (
    <>
      {/* Product Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Products</div>
            <div className="stat-icon">
              <i className="bi bi-box"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.all}</div>
          <div className="stat-change positive">Total products in system</div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-header">
            <div className="stat-title">Active Products</div>
            <div className="stat-icon">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.active}</div>
          <div className="stat-change positive">Available for purchase</div>
        </div>

        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-title">Pending Approval</div>
            <div className="stat-icon">
              <i className="bi bi-clock"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.pending}</div>
          <div className="stat-change">Awaiting review</div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-header">
            <div className="stat-title">Out of Stock</div>
            <div className="stat-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts['out-of-stock']}</div>
          <div className="stat-change negative">Need restocking</div>
        </div>
      </div>

      {/* Products Management */}
      <div className="admin-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div id="datatableButtons" className="d-flex gap-2">
              {/* DataTables export buttons */}
              <button 
                className="btn btn-primary"
                onClick={() => copyToClipboard(filteredProducts)}
                title="Copy table data to clipboard"
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
              <button 
                className="btn btn-success"
                onClick={() => exportToExcel(filteredProducts, 'products_report')}
                title="Export to Excel"
              >
                <i className="bi bi-file-earmark-excel"></i> Excel
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => exportToCSV(filteredProducts, 'products_report')}
                title="Export to CSV"
              >
                <i className="bi bi-file-earmark-text"></i> CSV
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => exportToPDF(filteredProducts, 'products_report')}
                title="Export to PDF"
              >
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </button>
              <button 
                className="btn btn-info"
                onClick={() => printTable(filteredProducts)}
                title="Print table"
              >
                <i className="bi bi-printer"></i> Print
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search products..."
                style={{ width: '250px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Status Tabs */}
        <div className="product-tabs" style={{ margin: 0, borderBottom: '1px solid var(--admin-border)', background: 'white' }}>
          <div className="tab-navigation" style={{ display: 'flex', gap: 0, width: '100%' }}>
            <button 
              className={`tab-btn ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
              style={{
                flex: 1,
                padding: '18px 24px',
                border: 'none',
                background: selectedStatus === 'all' ? 'white' : '#f8f9fa',
                color: selectedStatus === 'all' ? 'var(--primary-color)' : 'var(--secondary-color)',
                fontWeight: 600,
                fontSize: '14px',
                borderBottom: selectedStatus === 'all' ? '4px solid var(--primary-color)' : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <i className="bi bi-grid" style={{ marginRight: '8px', fontSize: '16px' }}></i>
              All Products (<span>{statusCounts.all}</span>)
            </button>
            <button 
              className={`tab-btn ${selectedStatus === 'proposed' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('proposed')}
              style={{
                flex: 1,
                padding: '18px 24px',
                border: 'none',
                background: selectedStatus === 'proposed' ? 'white' : '#f8f9fa',
                color: selectedStatus === 'proposed' ? 'var(--primary-color)' : 'var(--secondary-color)',
                fontWeight: 600,
                fontSize: '14px',
                borderBottom: selectedStatus === 'proposed' ? '4px solid var(--primary-color)' : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <i className="bi bi-clock" style={{ marginRight: '8px', fontSize: '16px' }}></i>
              Proposed (<span>{statusCounts.proposed}</span>)
            </button>
            <button 
              className={`tab-btn ${selectedStatus === 'published' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('published')}
              style={{
                flex: 1,
                padding: '18px 24px',
                border: 'none',
                background: selectedStatus === 'published' ? 'white' : '#f8f9fa',
                color: selectedStatus === 'published' ? 'var(--primary-color)' : 'var(--secondary-color)',
                fontWeight: 600,
                fontSize: '14px',
                borderBottom: selectedStatus === 'published' ? '4px solid var(--primary-color)' : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <i className="bi bi-check-circle" style={{ marginRight: '8px', fontSize: '16px' }}></i>
              Published (<span>{statusCounts.published}</span>)
            </button>
            <button 
              className={`tab-btn ${selectedStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('rejected')}
              style={{
                flex: 1,
                padding: '18px 24px',
                border: 'none',
                background: selectedStatus === 'rejected' ? 'white' : '#f8f9fa',
                color: selectedStatus === 'rejected' ? 'var(--primary-color)' : 'var(--secondary-color)',
                fontWeight: 600,
                fontSize: '14px',
                borderBottom: selectedStatus === 'rejected' ? '4px solid var(--primary-color)' : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <i className="bi bi-x-circle" style={{ marginRight: '8px', fontSize: '16px' }}></i>
              Rejected (<span>{statusCounts.rejected}</span>)
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <table className="admin-table table table-striped table-hover" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Producer</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>LGU Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr 
                  key={product.id}
                  data-status={product.status}
                  onClick={() => handleRowClick(product.id)}
                  style={{ cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img 
                        src={product.image}
                        alt="Product"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover', 
                          borderRadius: '4px' 
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{product.producer}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.stock} pcs</td>
                  <td>{getStatusBadge(product.status)}</td>
                  <td>{getLguStatusBadge(product.lguVerified)}</td>
                  <td>
                    <div className="d-flex gap-1" style={{
                      flexWrap: 'nowrap',
                      alignItems: 'center',
                      justifyContent: 'flex-start'
                    }}>
                      {/* Active product actions */}
                      {product.status === 'active' && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Edit Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'edit')
                            }}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="info"
                            icon="bi bi-tags"
                            title="Categorize Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'categorize')
                            }}
                          >
                            Category
                          </ActionButton>
                          <ActionButton
                            variant="warning"
                            icon="bi bi-archive"
                            title="Archive Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'archive')
                            }}
                          >
                            Archive
                          </ActionButton>
                        </>
                      )}

                      {/* Out of stock product actions */}
                      {product.status === 'out-of-stock' && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Edit Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'edit')
                            }}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-plus-square"
                            title="Restock Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'restock')
                            }}
                          >
                            Restock
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            icon="bi bi-trash"
                            title="Delete Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'delete')
                            }}
                          >
                            Delete
                          </ActionButton>
                        </>
                      )}

                      {/* Proposed product actions */}
                      {product.status === 'proposed' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-check-circle"
                            title="Publish Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'approve')
                            }}
                          >
                            Publish
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            icon="bi bi-x-circle"
                            title="Reject Product"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(product, 'reject')
                            }}
                          >
                            Reject
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary-color)' }}>
              <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No products found</div>
              <div style={{ fontSize: '14px' }}>Try selecting a different status tab</div>
            </div>
          )}

          {/* Dynamic Pagination */}
          {pagination}
        </div>
      </div>

      {/* Modal Components */}
      <EditProductModal
        show={showEditModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onEdit={(productId, data) => {
          console.log('Editing product:', productId, data)
          alert('Product updated successfully!')
          closeAllModals()
        }}
      />

      <ApproveProductModal
        show={showApproveModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onApprove={confirmApproveProduct}
      />
      
      <RejectProductModal
        show={showRejectModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onReject={confirmRejectProduct}
      />
      
      <RestockProductModal
        show={showRestockModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onRestock={(productId, data) => {
          console.log('Restocking product:', productId, data)
          alert('Product restocked successfully!')
          closeAllModals()
        }}
      />
      
      <DeleteProductModal
        show={showDeleteModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onDelete={(productId, data) => {
          console.log('Deleting product:', productId, data)
          alert('Product deleted successfully!')
          closeAllModals()
        }}
      />
      
      <ArchiveProductModal
        show={showArchiveModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onArchive={(productId, data) => {
          console.log('Archiving product:', productId, data)
          alert('Product archived successfully!')
          closeAllModals()
        }}
      />
      
      <CategorizeProductModal
        show={showCategorizeModal}
        onClose={closeAllModals}
        product={selectedProduct}
        onCategorize={(productId, data) => {
          console.log('Categorizing product:', productId, data)
          alert('Product categorization updated successfully!')
          closeAllModals()
        }}
      />
    </>
  )
}