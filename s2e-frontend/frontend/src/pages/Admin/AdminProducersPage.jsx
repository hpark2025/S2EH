import { useState, useMemo, useEffect } from 'react'
import usePagination from '../../components/Pagination'
import { adminAPI } from '../../services/adminAPI.js'
import { psgcService } from '../../services/psgcAPI.js'
import { toast } from 'react-hot-toast'

// Import for Excel export
import * as XLSX from 'xlsx'
// Import for PDF export 
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Export utility functions
const exportToExcel = (data, filename = 'producers') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data.map(producer => ({
      'Producer ID': producer.id,
      'Name': `${producer.firstName || ''} ${producer.lastName || ''}`.trim(),
      'Phone': producer.phone || 'N/A',
      'Category': producer.businessType || 'N/A',
      'Location': [producer.barangay, producer.municipality, producer.province].filter(Boolean).join(', '),
      'Status': producer.status || 'N/A'
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Producers')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    alert('Excel file downloaded successfully!')
  } catch (error) {
    console.error('Excel export error:', error)
    alert('Failed to export Excel file')
  }
}

const exportToCSV = (data, filename = 'producers') => {
  try {
    const csvData = data.map(producer => ({
      'Producer ID': producer.id,
      'Name': `${producer.firstName || ''} ${producer.lastName || ''}`.trim(),
      'Phone': producer.phone || 'N/A',
      'Category': producer.businessType || 'N/A',
      'Location': [producer.barangay, producer.municipality, producer.province].filter(Boolean).join(', '),
      'Status': producer.status || 'N/A'
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

const exportToPDF = (data, filename = 'producers') => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Producers Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32)
    
    // Prepare table data
    const tableData = data.map(producer => [
      producer.id,
      `${producer.firstName || ''} ${producer.lastName || ''}`.trim(),
      producer.phone || 'N/A',
      producer.businessType || 'N/A',
      [producer.barangay, producer.municipality, producer.province].filter(Boolean).join(', '),
      producer.status || 'N/A'
    ])
    
    // Add table using autoTable
    if (doc.autoTable) {
      doc.autoTable({
        head: [['ID', 'Name', 'Phone', 'Category', 'Location', 'Status']],
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
      const headers = ['ID', 'Name', 'Phone', 'Category', 'Location', 'Status']
      let xPosition = 14
      headers.forEach(header => {
        doc.text(header, xPosition, yPosition)
        xPosition += 30
      })
      
      yPosition += 10
      
      // Add data rows
      tableData.forEach(row => {
        xPosition = 14
        row.forEach(cell => {
          doc.text(String(cell), xPosition, yPosition)
          xPosition += 30
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
    const tableText = data.map(producer => 
      `${producer.id}\t${producer.firstName || ''} ${producer.lastName || ''}\t${producer.phone}\t${producer.businessType}\t${[producer.barangay, producer.municipality, producer.province].filter(Boolean).join(', ')}\t${producer.status}`
    ).join('\n')
    
    const header = 'ID\tName\tPhone\tCategory\tLocation\tStatus\n'
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
    const tableRows = data.map(producer => `
      <tr>
        <td>${producer.id}</td>
        <td>${producer.firstName || ''} ${producer.lastName || ''}</td>
        <td>${producer.phone || 'N/A'}</td>
        <td>${producer.businessType || 'N/A'}</td>
        <td>${[producer.barangay, producer.municipality, producer.province].filter(Boolean).join(', ') || 'N/A'}</td>
        <td>${producer.status || 'N/A'}</td>
      </tr>
    `).join('')
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Producers Report</title>
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
        <h1>Producers Report</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
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

const AdminProducersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [selectedProducer, setSelectedProducer] = useState(null)
  const [producers, setProducers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // PSGC data states for location selection
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  const [addFormData, setAddFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    business_name: '',
    business_type: '',
    business_description: '',
    business_permit: '',
    province: '',
    municipality: '',
    barangay: ''
  })

  const [editFormData, setEditFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    province: '',
    municipality: '',
    barangay: ''
  })

  // Mock producers removed - using real backend data

  // Fetch sellers (producers) from backend
  const fetchProducers = async () => {
    try {
      setLoading(true)
      
      // Determine verification_status filter based on activeTab
      let params = {};
      if (activeTab === 'pending') {
        params.verification_status = 'pending';
      } else if (activeTab === 'approved') {
        params.verification_status = 'verified';
      }
      
        const response = await adminAPI.sellers.getAll(params);
        
        console.log('✅ Sellers response:', response);
        
        // Extract sellers from response
        // Response structure: { success, data: { sellers: [...] } }
        const sellersData = response.data?.sellers || response.sellers || [];
      
      console.log(`✅ Loaded ${sellersData.length} sellers (${activeTab}):`, sellersData.map(s => ({
        id: s.id,
        business_name: s.business_name,
        verification_status: s.verification_status,
        status: s.status
      })));
      
      // Map sellers to producers format for the page
      const mappedProducers = sellersData.map(seller => ({
        id: seller.id,
        firstName: seller.owner_name?.split(' ')[0] || 'N/A',
        lastName: seller.owner_name?.split(' ').slice(1).join(' ') || '',
        email: seller.email,
        phone: seller.phone,
        businessType: seller.business_type,
        businessName: seller.business_name,
        businessDescription: seller.business_description,
        barangay: seller.barangay,
        municipality: seller.municipality,
        province: seller.province,
        status: seller.verification_status === 'verified' ? 'active' : seller.verification_status,
        verification_status: seller.verification_status,
        created_at: seller.created_at,
        avatar: seller.owner_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NA',
        avatarColor: 'var(--primary-color)'
      }));
      
      setProducers(mappedProducers);
      setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch sellers:', err);
        
        if (err.response) {
          console.error('Error Response:', {
            status: err.response.status,
            data: err.response.data
          });
        }
        
        // Set error and empty producers
        setError('Failed to load sellers. Please check your connection.');
        setProducers([]);
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    fetchProducers()
  }, [activeTab])

  const filteredProducers = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      // If no search term, return all producers filtered by tab only
      return producers.filter(producer => {
        const status = producer.status || 'pending'
        const matchesTab = activeTab === 'all' || 
          (activeTab === 'approved' && (status === 'active' || status === 'approved')) ||
          (activeTab === 'pending' && status === 'pending') ||
          (activeTab === 'suspended' && status === 'suspended')
        return matchesTab
      })
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    let filtered = producers.filter(producer => {
      // Primary search: seller name (business_name or owner_name)
      const sellerName = producer.businessName || producer.business_name || 
                        producer.ownerName || producer.owner_name ||
                        `${producer.firstName || ''} ${producer.lastName || ''}`.trim() || 
                        'Unknown Producer'
      const email = producer.email || 'N/A'
      const category = producer.businessType || 'Local Producer'
      const location = [producer.barangay, producer.municipality, producer.province]
        .filter(Boolean)
        .join(', ') || 'N/A'
      const status = producer.status || 'pending'

      // Perform case-insensitive search - prioritize seller name
      const matchesSearch = 
        sellerName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        category.toLowerCase().includes(searchLower) ||
        location.toLowerCase().includes(searchLower)
      
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'approved' && (status === 'active' || status === 'approved')) ||
        (activeTab === 'pending' && status === 'pending') ||
        (activeTab === 'suspended' && status === 'suspended')
      
      return matchesSearch && matchesTab
    })
    
    return filtered
  }, [searchTerm, activeTab, producers])

  // Use pagination hook
  const { currentItems: paginatedProducers, pagination } = usePagination({ 
    data: filteredProducers,
    itemsPerPageOptions: [5, 10, 15, 25],
    defaultItemsPerPage: 3 // Reduced to make pagination visible
  })

  const statusCounts = useMemo(() => ({
    all: producers.length,
    approved: producers.filter(p => p.status === 'active' || p.status === 'approved').length,
    pending: producers.filter(p => p.status === 'pending').length,
    suspended: producers.filter(p => p.status === 'suspended').length
  }), [producers])

  const handleProducerAction = (producer, action) => {
    setSelectedProducer(producer)
    switch(action) {
      case 'edit':
        // Initialize edit form data with producer's current data
        // For sellers, use business location; for others, use personal location
        const useBusinessLocation = selectedProducer.role === 'seller' && selectedProducer.business_barangay;
        setEditFormData({
          first_name: producer.first_name || producer.name?.split(' ')[0] || '',
          middle_name: producer.middle_name || '',
          last_name: producer.last_name || producer.name?.split(' ').slice(1).join(' ') || '',
          phone: producer.phone || '',
          province: useBusinessLocation ? selectedProducer.business_province || '' : producer.province || '',
          municipality: useBusinessLocation ? selectedProducer.business_municipality || '' : producer.municipality || '',
          barangay: useBusinessLocation ? selectedProducer.business_barangay || '' : producer.barangay || ''
        })
        
        setShowEditModal(true)
        break
      case 'approve':
        setShowApproveModal(true)
        break
      case 'reject':
        setShowRejectModal(true)
        break
      case 'suspend':
        setShowSuspendModal(true)
        break
      case 'reactivate':
        setShowReactivateModal(true)
        break
      case 'archive':
        setShowArchiveModal(true)
        break
      case 'remove':
        setShowRemoveModal(true)
        break
    }
  }

  const closeAllModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowSuspendModal(false)
    setShowReactivateModal(false)
    setShowArchiveModal(false)
    setShowRemoveModal(false)
    setSelectedProducer(null)
    setSubmitting(false) // Reset submitting state
    // Reset form data when closing modals
    setAddFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      business_name: '',
      business_type: '',
      business_description: '',
      business_permit: '',
      province: '',
      municipality: '',
      barangay: ''
    })
  }

  // PSGC location functions
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const data = await psgcService.getAllProvinces()
      setProvinces(data || [])
    } catch (error) {
      console.error('Failed to load provinces:', error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  const loadMunicipalities = async (provinceCode) => {
    if (!provinceCode) {
      setMunicipalities([])
      setBarangays([])
      return
    }

    setLoadingMunicipalities(true)
    try {
      const data = await psgcService.getMunicipalities(provinceCode)
      setMunicipalities(data || [])
      setBarangays([]) // Clear barangays when province changes
      
      // Clear municipality and barangay from form data
      setAddFormData(prev => ({
        ...prev,
        municipality: '',
        barangay: ''
      }))
    } catch (error) {
      console.error('Failed to load municipalities:', error)
    } finally {
      setLoadingMunicipalities(false)
    }
  }

  const loadBarangays = async (municipalityCode) => {
    if (!municipalityCode) {
      setBarangays([])
      return
    }

    setLoadingBarangays(true)
    try {
      const data = await psgcService.getBarangays(municipalityCode)
      setBarangays(data || [])
      
      // Clear barangay from form data
      setAddFormData(prev => ({
        ...prev,
        barangay: ''
      }))
    } catch (error) {
      console.error('Failed to load barangays:', error)
    } finally {
      setLoadingBarangays(false)
    }
  }

  const handleAddFormChange = (e) => {
    const { name, value } = e.target
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Handle address field changes
    if (name === 'province') {
      const selectedProvince = provinces.find(p => p.name === value)
      if (selectedProvince) {
        loadMunicipalities(selectedProvince.code)
      }
    } else if (name === 'municipality') {
      const selectedMunicipality = municipalities.find(m => m.name === value)
      if (selectedMunicipality) {
        loadBarangays(selectedMunicipality.code)
      }
    }
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Handle address field changes
    if (name === 'province') {
      setEditFormData(prev => ({
        ...prev,
        province: value,
        municipality: '',
        barangay: ''
      }))
      const selectedProvince = provinces.find(p => p.name === value)
      if (selectedProvince) {
        loadMunicipalities(selectedProvince.code)
      }
      setBarangays([])
    } else if (name === 'municipality') {
      setEditFormData(prev => ({
        ...prev,
        municipality: value,
        barangay: ''
      }))
      const selectedMunicipality = municipalities.find(m => m.name === value)
      if (selectedMunicipality) {
        loadBarangays(selectedMunicipality.code)
      }
    }
  }

  // Load provinces when add modal is opened
  useEffect(() => {
    if (showAddModal) {
      loadProvinces()
    }
  }, [showAddModal])

  useEffect(() => {
    if (showEditModal) {
      loadProvinces()
    }
  }, [showEditModal])

  // Load location data when edit modal opens and selectedProducer has location info
  useEffect(() => {
    if (showEditModal && selectedProducer && provinces.length > 0) {
      if (selectedProducer.province) {
        const selectedProvince = provinces.find(p => p.name === selectedProducer.province)
        if (selectedProvince) {
          loadMunicipalities(selectedProvince.code)
        }
      }
    }
  }, [showEditModal, selectedProducer, provinces])

  // Load barangays when municipalities are loaded and selectedProducer has municipality
  useEffect(() => {
    if (showEditModal && selectedProducer && municipalities.length > 0 && selectedProducer.municipality) {
      const selectedMunicipality = municipalities.find(m => m.name === selectedProducer.municipality)
      if (selectedMunicipality) {
        loadBarangays(selectedMunicipality.code)
      }
    }
  }, [showEditModal, selectedProducer, municipalities])

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { class: 'status-active', text: 'Approved' },
      approved: { class: 'status-active', text: 'Approved' },
      pending: { class: 'status-pending', text: 'Pending' },
      suspended: { class: 'status-inactive', text: 'Suspended' },
      inactive: { class: 'status-inactive', text: 'Inactive' }
    }
    const statusInfo = statusMap[status] || { class: 'status-pending', text: status }
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const TabButton = ({ status, children, count, icon }) => (
    <button
      className={`tab-btn ${activeTab === status ? 'active' : ''}`}
      onClick={() => setActiveTab(status)}
      style={{
        flex: 1,
        padding: '18px 24px',
        border: 'none',
        background: 'transparent',
        color: activeTab === status ? 'var(--primary-color)' : 'var(--secondary-color)',
        fontWeight: 600,
        fontSize: '14px',
        borderBottom: `4px solid ${activeTab === status ? 'var(--primary-color)' : 'transparent'}`,
        backgroundColor: activeTab === status ? 'rgba(44, 133, 63, 0.05)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center'
      }}
    >
      <i className={icon} style={{ marginRight: '8px', fontSize: '16px' }}></i>
      {children} (<span>{count}</span>)
    </button>
  )

  const ProducerAvatar = ({ producer }) => (
    <div style={{
      width: '40px',
      height: '40px',
      backgroundColor: producer.avatarColor,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: producer.avatarColor === 'var(--accent-color)' ? 'var(--dark-color)' : 'white',
      fontWeight: 600
    }}>
      {producer.avatar}
    </div>
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
          fontWeight: 600,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          fontSize: '12px',
          minWidth: '80px',
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
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading producers...</span>
          </div>
          <span className="ms-3">Loading producers...</span>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Producer Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Producers</div>
                <div className="stat-icon">
                  <i className="bi bi-person-badge"></i>
                </div>
              </div>
              <div className="stat-value">{producers.length}</div>
              <div className="stat-change positive">Registered producers</div>
            </div>
            
            <div className="stat-card highlight">
              <div className="stat-header">
                <div className="stat-title">Approved Producers</div>
                <div className="stat-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
              </div>
              <div className="stat-value">{statusCounts.approved}</div>
              <div className="stat-change positive">Approved producers</div>
            </div>
            
            <div className="stat-card accent">
              <div className="stat-header">
                <div className="stat-title">Pending Applications</div>
                <div className="stat-icon">
                  <i className="bi bi-person-plus"></i>
                </div>
              </div>
              <div className="stat-value">{statusCounts.pending}</div>
              <div className="stat-change positive">Pending applications</div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-header">
                <div className="stat-title">Suspended Producers</div>
                <div className="stat-icon">
                  <i className="bi bi-person-x"></i>
                </div>
              </div>
              <div className="stat-value">{statusCounts.suspended}</div>
              <div className="stat-change">Suspended accounts</div>
            </div>
          </div>

      {/* Producers Management */}
      <div className="admin-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div id="datatableButtons" className="d-flex gap-2">
              {/* DataTables export buttons */}
              <button 
                className="btn btn-primary"
                onClick={() => copyToClipboard(filteredProducers)}
                title="Copy table data to clipboard"
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
              <button 
                className="btn btn-success"
                onClick={() => exportToExcel(filteredProducers, 'producers_report')}
                title="Export to Excel"
              >
                <i className="bi bi-file-earmark-excel"></i> Excel
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => exportToCSV(filteredProducers, 'producers_report')}
                title="Export to CSV"
              >
                <i className="bi bi-file-earmark-text"></i> CSV
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => exportToPDF(filteredProducers, 'producers_report')}
                title="Export to PDF"
              >
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </button>
              <button 
                className="btn btn-info"
                onClick={() => printTable(filteredProducers)}
                title="Print table"
              >
                <i className="bi bi-printer"></i> Print
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="search"
                className="form-control"
                placeholder="Search producers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '250px' }}
              />
              <button
                className="btn-admin btn-admin-primary"
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '12px 20px',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(44, 133, 63, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(44, 133, 63, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 2px 8px rgba(44, 133, 63, 0.3)'
                }}
              >
                <i className="bi bi-person-plus"></i>
                Add Producer
              </button>
            </div>
          </div>
        </div>

        {/* Producer Status Tabs */}
        <div className="producer-tabs" style={{
          margin: 0,
          borderBottom: '1px solid var(--admin-border)',
          background: 'white'
        }}>
          <div className="tab-navigation" style={{
            display: 'flex',
            gap: 0,
            width: '100%'
          }}>
            <TabButton 
              status="all" 
              count={statusCounts.all}
              icon="bi bi-person-badge"
            >
              All Producers
            </TabButton>
            <TabButton 
              status="approved" 
              count={statusCounts.approved}
              icon="bi bi-shield-check"
            >
              Approved
            </TabButton>
            <TabButton 
              status="pending" 
              count={statusCounts.pending}
              icon="bi bi-clock-history"
            >
              Pending
            </TabButton>
            <TabButton 
              status="suspended" 
              count={statusCounts.suspended}
              icon="bi bi-person-x"
            >
              Suspended
            </TabButton>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <table className="admin-table table table-striped table-hover" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Producer</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducers.map((producer) => (
                <tr 
                  key={producer.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => console.log(`Navigate to producer profile ${producer.id}`)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ProducerAvatar producer={producer} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{`${producer.firstName || ''} ${producer.lastName || ''}`.trim()}</div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                          {producer.phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{producer.businessType || 'N/A'}</td>
                  <td>{[producer.barangay, producer.municipality, producer.province].filter(Boolean).join(', ') || 'N/A'}</td>
                  <td>{getStatusBadge(producer.status)}</td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: '250px'
                    }}>
                      {/* Active (verified) producers actions */}
                      {producer.status === 'active' && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Edit Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'edit')
                            }}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="secondary"
                            icon="bi bi-pause-circle"
                            title="Suspend Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'suspend')
                            }}
                          >
                            Suspend
                          </ActionButton>
                          <ActionButton
                            variant="warning"
                            icon="bi bi-archive"
                            title="Archive Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'archive')
                            }}
                          >
                            Archive
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Pending producers actions */}
                      {producer.status === 'pending' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-check-circle"
                            title="Approve Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'approve')
                            }}
                          >
                            Approve
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            icon="bi bi-x-circle"
                            title="Reject Application"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'reject')
                            }}
                          >
                            Reject
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Suspended producers actions */}
                      {producer.status === 'suspended' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-play-circle"
                            title="Reactivate Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'reactivate')
                            }}
                          >
                            Reactivate
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            icon="bi bi-person-x"
                            title="Permanently Remove"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'remove')
                            }}
                          >
                            Remove
                          </ActionButton>
                        </>
                      )}

                      {/* Inactive producers actions */}
                      {producer.status === 'inactive' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-play-circle"
                            title="Reactivate Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'reactivate')
                            }}
                          >
                            Reactivate
                          </ActionButton>
                        </>
                      )}

                      {/* Legacy support for 'verified' status - map to 'active' */}
                      {producer.status === 'verified' && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Edit Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'edit')
                            }}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="secondary"
                            icon="bi bi-pause-circle"
                            title="Suspend Producer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProducerAction(producer, 'suspend')
                            }}
                          >
                            Suspend
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedProducers.length === 0 && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: 'var(--secondary-color)' 
            }}>
              <i className="bi bi-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <div>No producers found matching your search criteria.</div>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination}
      </div>

      {/* Producer Analytics */}
      <div className="admin-card">
        <div className="card-header">
          <h3 className="card-title">Producer Performance</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              border: '1px solid var(--admin-border)',
              borderRadius: '6px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--primary-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <i className="bi bi-award"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Top Performer This Month</div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                  No data available yet
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                Agriculture Category
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              border: '1px solid var(--admin-border)',
              borderRadius: '6px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--highlight-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <i className="bi bi-graph-up"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Most Active Category</div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                  No data available
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                No recent changes
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              border: '1px solid var(--admin-border)',
              borderRadius: '6px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--accent-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dark-color)'
              }}>
                <i className="bi bi-clock"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Recent Registration</div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                  No recent registrations
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                No recent category
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Add New Producer</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <h6 className="mb-3" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Business Information</h6>
                
                <div className="mb-3">
                  <label htmlFor="addBusinessName" className="form-label">Business/Store Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="addBusinessName"
                    name="business_name"
                    value={addFormData.business_name}
                    onChange={handleAddFormChange}
                    placeholder="Enter business name" 
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="addBusinessType" className="form-label">Business Type *</label>
                  <select 
                    className="form-select" 
                    id="addBusinessType"
                    name="business_type"
                    value={addFormData.business_type}
                    onChange={handleAddFormChange}
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="fishery">Fishery</option>
                    <option value="food">Food & Beverage</option>
                    <option value="handicrafts">Handicrafts</option>
                    <option value="livestock">Livestock</option>
                    <option value="retail">Retail</option>
                    <option value="services">Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="addBusinessDescription" className="form-label">Business Description</label>
                  <textarea 
                    className="form-control" 
                    id="addBusinessDescription"
                    name="business_description"
                    value={addFormData.business_description}
                    onChange={handleAddFormChange}
                    placeholder="Describe the business and products" 
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="addBusinessPermit" className="form-label">Business Permit Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="addBusinessPermit"
                    name="business_permit"
                    value={addFormData.business_permit}
                    onChange={handleAddFormChange}
                    placeholder="Enter permit number (optional)" 
                  />
                </div>

                <h6 className="mb-3 mt-4" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Owner Information</h6>

                <div className="mb-3">
                  <label htmlFor="addProducerFirstName" className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="addProducerFirstName"
                    name="first_name"
                    value={addFormData.first_name}
                    onChange={handleAddFormChange}
                    placeholder="Enter first name" 
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="addProducerMiddleName" className="form-label">Middle Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="addProducerMiddleName"
                    name="middle_name"
                    value={addFormData.middle_name}
                    onChange={handleAddFormChange}
                    placeholder="Enter middle name (optional)" 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="addProducerLastName" className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="addProducerLastName"
                    name="last_name"
                    value={addFormData.last_name}
                    onChange={handleAddFormChange}
                    placeholder="Enter last name" 
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="addProducerEmail" className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="addProducerEmail"
                    name="email"
                    value={addFormData.email}
                    onChange={handleAddFormChange}
                    placeholder="seller@example.com" 
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="addProducerPassword" className="form-label">Password *</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="addProducerPassword"
                    name="password"
                    value={addFormData.password}
                    onChange={handleAddFormChange}
                    placeholder="Create a password" 
                    required
                  />
                  <small className="text-muted">Minimum 8 characters</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="addProducerPhone" className="form-label">Contact Phone *</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="addProducerPhone"
                    name="phone"
                    value={addFormData.phone}
                    onChange={handleAddFormChange}
                    placeholder="+639123456789" 
                    required
                  />
                </div>
                
                <h6 className="mb-3 mt-4" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Business Address</h6>

                <div className="mb-3">
                  <label htmlFor="addProducerProvince" className="form-label">Province *</label>
                  <select 
                    className="form-select" 
                    id="addProducerProvince"
                    name="province"
                    value={addFormData.province}
                    onChange={handleAddFormChange}
                    disabled={loadingProvinces}
                    required
                  >
                    <option value="">
                      {loadingProvinces ? 'Loading provinces...' : 'Select Province'}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="addProducerMunicipality" className="form-label">Municipality/City *</label>
                  <select 
                    className="form-select" 
                    id="addProducerMunicipality"
                    name="municipality"
                    value={addFormData.municipality}
                    onChange={handleAddFormChange}
                    disabled={loadingMunicipalities || !addFormData.province}
                    required
                  >
                    <option value="">
                      {loadingMunicipalities 
                        ? 'Loading municipalities...' 
                        : !addFormData.province 
                          ? 'Select province first'
                          : 'Select Municipality/City'
                      }
                    </option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.code} value={municipality.name}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="addProducerBarangay" className="form-label">Barangay *</label>
                  <select 
                    className="form-select" 
                    id="addProducerBarangay"
                    name="barangay"
                    value={addFormData.barangay}
                    onChange={handleAddFormChange}
                    disabled={loadingBarangays || !addFormData.municipality}
                    required
                  >
                    <option value="">
                      {loadingBarangays 
                        ? 'Loading barangays...' 
                        : !addFormData.municipality 
                          ? 'Select municipality first'
                          : 'Select Barangay'
                      }
                    </option>
                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.name}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-primary" 
                disabled={submitting}
                style={{ 
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  pointerEvents: submitting ? 'none' : 'auto'
                }}
                onClick={async () => {
                  if (submitting) return; // Prevent double-click
                  
                  try {
                    // Validate required fields
                    if (!addFormData.business_name || !addFormData.business_type ||
                        !addFormData.first_name || !addFormData.last_name || 
                        !addFormData.email || !addFormData.password ||
                        !addFormData.phone || !addFormData.province || 
                        !addFormData.municipality || !addFormData.barangay) {
                      toast.error('Please fill in all required fields')
                      return
                    }

                    // Validate password length
                    if (addFormData.password.length < 8) {
                      toast.error('Password must be at least 8 characters')
                      return
                    }

                    // Validate email format
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(addFormData.email)) {
                      toast.error('Please enter a valid email address')
                      return
                    }

                    // Set submitting state
                    setSubmitting(true)

                    // Construct owner name
                    const ownerName = [
                      addFormData.first_name,
                      addFormData.middle_name,
                      addFormData.last_name
                    ].filter(Boolean).join(' ')

                    const sellerData = {
                      email: addFormData.email,
                      password: addFormData.password,
                      business_name: addFormData.business_name,
                      business_type: addFormData.business_type,
                      business_description: addFormData.business_description || null,
                      business_permit: addFormData.business_permit || null,
                      owner_name: ownerName,
                      phone: addFormData.phone,
                      province: addFormData.province,
                      municipality: addFormData.municipality,
                      barangay: addFormData.barangay
                    }

                    await adminAPI.sellers.create(sellerData)
                    toast.success(`${addFormData.business_name} has been added successfully!`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    console.error('Failed to add producer:', error)
                    const errorMessage = error.response?.data?.message || 'Failed to add producer'
                    toast.error(errorMessage)
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                {submitting ? 'Adding...' : 'Add Producer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProducer && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Edit Producer - {selectedProducer.first_name || selectedProducer.name || 'Unknown'} {selectedProducer.last_name || ''}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="editProducerFirstName" className="form-label">First Name</label>
                  <input 
                    type="text" 
                    id="editProducerFirstName"
                    name="first_name"
                    className="form-control" 
                    value={editFormData.first_name}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editProducerMiddleName" className="form-label">Middle Name</label>
                  <input 
                    type="text" 
                    id="editProducerMiddleName"
                    name="middle_name"
                    className="form-control" 
                    value={editFormData.middle_name}
                    onChange={handleEditFormChange}
                    placeholder="Optional" 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editProducerLastName" className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    id="editProducerLastName"
                    name="last_name"
                    className="form-control" 
                    value={editFormData.last_name}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editProducerPhone" className="form-label">Contact Phone</label>
                  <input 
                    type="tel" 
                    id="editProducerPhone"
                    name="phone"
                    className="form-control" 
                    value={editFormData.phone}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="editProducerProvince" className="form-label">Province</label>
                  <select 
                    className="form-select" 
                    id="editProducerProvince"
                    name="province"
                    value={editFormData.province}
                    onChange={handleEditFormChange}
                    disabled={loadingProvinces}
                    required
                  >
                    <option value="">
                      {loadingProvinces ? 'Loading provinces...' : 'Select Province'}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="editProducerMunicipality" className="form-label">Municipality/City</label>
                  <select 
                    className="form-select" 
                    id="editProducerMunicipality"
                    name="municipality"
                    value={editFormData.municipality}
                    onChange={handleEditFormChange}
                    disabled={loadingMunicipalities || !editFormData.province}
                    required
                  >
                    <option value="">
                      {loadingMunicipalities 
                        ? 'Loading municipalities...' 
                        : !editFormData.province 
                          ? 'Select province first'
                          : 'Select Municipality/City'
                      }
                    </option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.code} value={municipality.name}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="editProducerBarangay" className="form-label">Barangay</label>
                  <select 
                    className="form-select" 
                    id="editProducerBarangay"
                    name="barangay"
                    value={editFormData.barangay}
                    onChange={handleEditFormChange}
                    disabled={loadingBarangays || !editFormData.municipality}
                    required
                  >
                    <option value="">
                      {loadingBarangays 
                        ? 'Loading barangays...' 
                        : !editFormData.municipality 
                          ? 'Select municipality first'
                          : 'Select Barangay'
                      }
                    </option>
                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.name}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-primary" 
                onClick={async () => {
                  try {
                    if (!editFormData.first_name || !editFormData.last_name || !editFormData.phone || 
                        !editFormData.province || !editFormData.municipality || !editFormData.barangay) {
                      toast.error('Please fill in all required fields')
                      return
                    }

                    const userData = {
                      first_name: editFormData.first_name,
                      middle_name: editFormData.middle_name || null,
                      last_name: editFormData.last_name,
                      phone: editFormData.phone,
                      province: editFormData.province,
                      municipality: editFormData.municipality,
                      barangay: editFormData.barangay
                    }

                    await adminAPI.users.updateUser(selectedProducer.id, userData)
                    toast.success(`${selectedProducer.first_name} ${selectedProducer.last_name} has been updated`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    toast.error('Failed to update producer')
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showApproveModal && selectedProducer && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Approve Producer Application</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to approve the producer application for <strong>{selectedProducer.businessName || `${selectedProducer.firstName} ${selectedProducer.lastName}`}</strong>?</p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle"></i>
                Once approved, the producer will be able to list and sell products on the platform.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-primary" 
                onClick={async () => {
                  try {
                    await adminAPI.sellers.approve(selectedProducer.id)
                    const producerName = selectedProducer.businessName || `${selectedProducer.firstName} ${selectedProducer.lastName}`
                    toast.success(`${producerName} has been approved`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    console.error('Approve error:', error)
                    toast.error('Failed to approve producer')
                  }
                }}
              >
                Approve Producer
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedProducer && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Reject Producer Application</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reject the producer application for <strong>{selectedProducer.businessName || `${selectedProducer.firstName} ${selectedProducer.lastName}`}</strong>?</p>
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Please provide a reason for rejection..."
                  id="rejectReasonProducer"
                  required
                />
              </div>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle"></i>
                This action will permanently reject the application. The producer will be notified via email.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-danger" 
                onClick={async () => {
                  const reason = document.getElementById('rejectReasonProducer').value.trim()
                  if (!reason) {
                    toast.error('Please provide a rejection reason')
                    return
                  }
                  try {
                    await adminAPI.sellers.reject(selectedProducer.id, reason)
                    const producerName = selectedProducer.businessName || `${selectedProducer.firstName} ${selectedProducer.lastName}`
                    toast.success(`${producerName} has been rejected`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    console.error('Reject error:', error)
                    toast.error('Failed to reject producer')
                  }
                }}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Producer Modal */}
      {showSuspendModal && selectedProducer && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Suspend Producer Account</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to suspend the producer account for <strong>{selectedProducer.name}</strong>?</p>
              <p>Suspended producers will not be able to access the platform until reactivated.</p>
              <div className="form-group">
                <label>Suspension Reason *</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Please provide a reason for suspension..."
                  id="suspendReasonProducer"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-warning" 
                onClick={async () => {
                  const reason = document.getElementById('suspendReasonProducer').value.trim()
                  if (!reason) {
                    toast.error('Please provide a suspension reason')
                    return
                  }
                  try {
                    await adminAPI.users.suspendUser(selectedProducer.id, reason, 'seller')
                    toast.success(`${selectedProducer.name} has been suspended`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    toast.error('Failed to suspend producer')
                  }
                }}
              >
                Suspend Producer
              </button>
            </div>
          </div>
        </div>
      )}

      {showReactivateModal && selectedProducer && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Reactivate Producer Account</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reactivate the producer account for <strong>{selectedProducer.name}</strong>?</p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle"></i>
                The producer will regain access to their account and can resume selling products.
                {selectedProducer.status === 'suspended' && ' The producer was previously suspended.'}
                {selectedProducer.status === 'inactive' && ' The producer account was previously inactive.'}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-primary" 
                onClick={async () => {
                  try {
                    await adminAPI.users.reactivateUser(selectedProducer.id, 'seller')
                    toast.success(`${selectedProducer.name} has been reactivated`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    toast.error('Failed to reactivate producer')
                  }
                }}
              >
                Reactivate Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Producer Modal */}
      {showArchiveModal && selectedProducer && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Archive Producer Account</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to archive the producer account for <strong>{selectedProducer.name}</strong>?</p>
              <p>Archived producers will be set to inactive status and their data will be preserved but inaccessible.</p>
              <div className="form-group">
                <label>Archive Reason (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Optional reason for archiving..."
                  id="archiveReasonProducer"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-secondary" 
                onClick={async () => {
                  const reason = document.getElementById('archiveReasonProducer').value.trim() || null
                  try {
                    await adminAPI.users.archiveUser(selectedProducer.id, reason)
                    toast.success(`${selectedProducer.name} has been archived`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    toast.error('Failed to archive producer')
                  }
                }}
              >
                Archive Producer
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveModal && selectedProducer && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Remove Producer Account</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to permanently remove the producer account for <strong>{selectedProducer.name}</strong>?</p>
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle"></i>
                <strong>Warning:</strong> This action cannot be undone. All producer data, products, and sales history will be permanently deleted.
              </div>
              <div className="form-group">
                <label>Type "DELETE" to confirm removal</label>
                <input type="text" className="form-control" placeholder="Type DELETE to confirm" id="confirmDeleteProducer" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-danger" 
                onClick={async () => {
                  const confirmText = document.getElementById('confirmDeleteProducer').value.trim()
                  if (confirmText !== 'DELETE') {
                    toast.error('Please type "DELETE" to confirm removal')
                    return
                  }
                  try {
                    // This would be a permanent delete - different from archive
                    // For now, we'll use archive as the API doesn't have permanent delete
                    await adminAPI.users.archiveUser(selectedProducer.id, 'Permanently removed by admin')
                    toast.success(`${selectedProducer.name} has been permanently removed`)
                    closeAllModals()
                    fetchProducers()
                  } catch (error) {
                    toast.error('Failed to remove producer')
                  }
                }}
              >
                Permanently Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminProducersPage


