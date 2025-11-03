import { useState, useMemo, useEffect } from 'react'
import { AddUserModal, EditUserModal } from '../../components/AdminModals'
import usePagination from '../../components/Pagination'
import { adminAPI } from '../../services/adminAPI.js'
import { toast } from 'react-hot-toast'

// Import for Excel export
import * as XLSX from 'xlsx'
// Import for PDF export 
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Export utility functions
const exportToExcel = (data, filename = 'users') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data.map(user => ({
      'User ID': user.id,
      'Name': `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
      'Phone': user.phone || 'N/A',
      'Role': user.role || 'N/A',
      'Location': user.location || 'N/A',
      'Orders': user.orders,
      'Total Spent': `₱${user.totalSpent}`,
      'Last Active': user.lastActive,
      'Status': user.status
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    alert('Excel file downloaded successfully!')
  } catch (error) {
    console.error('Excel export error:', error)
    alert('Failed to export Excel file')
  }
}

const exportToCSV = (data, filename = 'users') => {
  try {
    const csvData = data.map(user => ({
      'User ID': user.id,
      'Name': user.name,
      'Phone': user.phone,
      'Role': user.role,
      'Location': user.location,
      'Orders': user.orders,
      'Total Spent': `₱${user.totalSpent}`,
      'Last Active': user.lastActive,
      'Status': user.status
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

const exportToPDF = (data, filename = 'users') => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Users Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32)
    
    // Prepare table data
    const tableData = data.map(user => [
      user.id,
      user.name,
      user.phone,
      user.role,
      user.location,
      user.orders,
      `₱${user.totalSpent}`,
      user.status
    ])
    
    // Add table using autoTable
    if (doc.autoTable) {
      doc.autoTable({
        head: [['ID', 'Name', 'Phone', 'Role', 'Location', 'Orders', 'Total Spent', 'Status']],
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
      const headers = ['ID', 'Name', 'Phone', 'Role', 'Location', 'Orders', 'Total Spent', 'Status']
      let xPosition = 14
      headers.forEach(header => {
        doc.text(header, xPosition, yPosition)
        xPosition += 23
      })
      
      yPosition += 10
      
      // Add data rows
      tableData.forEach(row => {
        xPosition = 14
        row.forEach(cell => {
          doc.text(String(cell), xPosition, yPosition)
          xPosition += 23
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
    const tableText = data.map(user => 
      `${user.id}\t${user.name}\t${user.phone}\t${user.role}\t${user.location}\t${user.orders}\t₱${user.totalSpent}\t${user.status}`
    ).join('\n')
    
    const header = 'ID\tName\tPhone\tRole\tLocation\tOrders\tTotal Spent\tStatus\n'
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
    const tableRows = data.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.phone}</td>
        <td>${user.role}</td>
        <td>${user.location}</td>
        <td>${user.orders}</td>
        <td>₱${user.totalSpent}</td>
        <td>${user.status}</td>
      </tr>
    `).join('')
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Users Report</title>
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
        <h1>Users Report</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Total Spent</th>
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

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Mock users data for development (no backend)
  const MOCK_USERS = [
    {
      id: 1,
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@email.com',
      phone: '+63 912 345 6789',
      role: 'Customer',
      location: 'Barangay 1, Naga City, Camarines Sur',
      orders: 12,
      totalSpent: 2500,
      lastActive: '2024-01-15',
      status: 'active',
      dateJoined: '2023-06-15',
      emailVerified: true,
      profileImage: null,
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+63 917 234 5678',
      role: 'Customer',
      location: 'Barangay 2, Legazpi City, Albay',
      orders: 8,
      totalSpent: 1800,
      lastActive: '2024-01-14',
      status: 'active',
      dateJoined: '2023-08-20',
      emailVerified: true,
      profileImage: null,
      avatar: 'MS'
    },
    {
      id: 3,
      name: 'Ana Rodriguez',
      email: 'ana.rodriguez@email.com',
      phone: '+63 918 345 6789',
      role: 'Customer',
      location: 'Barangay 3, Sorsogon City, Sorsogon',
      orders: 5,
      totalSpent: 1200,
      lastActive: '2024-01-10',
      status: 'pending',
      dateJoined: '2024-01-05',
      emailVerified: false,
      profileImage: null,
      avatar: 'AR'
    },
    {
      id: 4,
      name: 'Pedro Garcia',
      email: 'pedro.garcia@email.com',
      phone: '+63 919 456 7890',
      role: 'Customer',
      location: 'Barangay 4, Iriga City, Camarines Sur',
      orders: 3,
      totalSpent: 750,
      lastActive: '2024-01-08',
      status: 'suspended',
      dateJoined: '2023-11-10',
      emailVerified: true,
      profileImage: null,
      avatar: 'PG'
    },
    {
      id: 5,
      name: 'Carmen Lopez',
      email: 'carmen.lopez@email.com',
      phone: '+63 920 567 8901',
      role: 'Customer',
      location: 'Barangay 5, Tabaco City, Albay',
      orders: 15,
      totalSpent: 3200,
      lastActive: '2024-01-16',
      status: 'active',
      dateJoined: '2023-05-12',
      emailVerified: true,
      profileImage: null,
      avatar: 'CL'
    }
  ]

  // Fetch users from backend
  const fetchUsers = async (options = {}) => {
    try {
      console.log('📡 Fetching users...', options);
      setLoading(true)
      const defaultOptions = {
        page: 1,
        limit: 100, // Get all users
        role: 'customer', // Default to customer
        status: selectedStatus !== 'all' ? selectedStatus : null
      }
      const fetchOptions = { ...defaultOptions, ...options }
      
      const response = await adminAPI.users.getAllUsers(fetchOptions)
      
      console.log('✅ Users response:', response);
      
      const usersData = response.data?.users || response.users || [];
      
      const transformedUsers = usersData.map(user => {
        // Calculate avatar initials
        const firstName = user.first_name || ''
        const lastName = user.last_name || ''
        const avatar = firstName && lastName 
          ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
          : firstName 
            ? firstName.charAt(0).toUpperCase()
            : lastName 
              ? lastName.charAt(0).toUpperCase()
              : 'U'
        
        // Format last active date
        let lastActive = 'Never'
        if (user.last_login) {
          const lastLoginDate = new Date(user.last_login)
          const now = new Date()
          const diffTime = Math.abs(now - lastLoginDate)
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 0) {
            lastActive = 'Today'
          } else if (diffDays === 1) {
            lastActive = 'Yesterday'
          } else if (diffDays < 7) {
            lastActive = `${diffDays} days ago`
          } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7)
            lastActive = `${weeks} week${weeks > 1 ? 's' : ''} ago`
          } else {
            lastActive = lastLoginDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          }
        }
        
        return {
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone || 'N/A',
          role: user.role || 'Customer',
          location: [user.barangay, user.municipality, user.province].filter(Boolean).join(', ') || 'N/A',
          barangay: user.barangay,
          municipality: user.municipality,
          province: user.province,
          orders: parseInt(user.orders_count || 0),
          totalSpent: parseFloat(user.total_spent || 0),
          lastActive: lastActive,
          status: user.status || 'active',
          dateJoined: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
          emailVerified: user.email_verified || false,
          profileImage: user.profile_image || null,
          createdAt: user.created_at,
          avatar: avatar
        }
      });
      
      console.log(`✅ Loaded ${transformedUsers.length} users`);
      setUsers(transformedUsers);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchUsers()
  }, [selectedStatus])

  const filteredUsers = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      // If no search term, return all users filtered by status only
      return users.filter(user => {
        return selectedStatus === 'all' || user.status === selectedStatus
      })
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    return users.filter(user => {
      // Primary search: customer name (first name + last name)
      const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
      const matchesSearch = 
        fullName.toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.phone || '').toLowerCase().includes(searchLower) ||
        (user.location || '').toLowerCase().includes(searchLower)
      
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
      
      return matchesSearch && matchesStatus
    })
  }, [users, searchTerm, selectedStatus])

  // Use pagination hook
  const { currentItems: paginatedUsers, pagination } = usePagination({ 
    data: filteredUsers,
    itemsPerPageOptions: [5, 10, 15, 25],
    defaultItemsPerPage: 3 // Reduced to make pagination visible
  })

  const statusCounts = useMemo(() => {
    return {
      all: users.length,
      active: users.filter(u => u.status === 'active').length,
      pending: users.filter(u => u.status === 'pending').length,
      suspended: users.filter(u => u.status === 'suspended').length
    }
  }, [users])

  // User action handlers
  const handleUserAction = async (user, action) => {
    setSelectedUser(user)
    switch (action) {
      case 'activate':
        setShowApproveModal(true)
        break
      case 'suspend':
        setShowSuspendModal(true)
        break
      case 'reactivate':
        setShowReactivateModal(true)
        break
      case 'edit':
        setShowEditModal(true)
        break
      case 'archive':
        setShowArchiveModal(true)
        break
      case 'reject':
        setShowRejectModal(true)
        break
      default:
        break
    }
  }

  const closeAllModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowApproveModal(false)
    setShowSuspendModal(false)
    setShowRejectModal(false)
    setShowReactivateModal(false)
    setShowArchiveModal(false)
    setSelectedUser(null)
  }

  const totalUsers = users.length
  const activeUsers = statusCounts.active
  const newThisMonth = statusCounts.pending
  const suspendedUsers = statusCounts.suspended

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'pending': return 'status-pending'
      case 'suspended': return 'status-inactive'
      case 'inactive': return 'status-inactive'
      default: return 'status-secondary'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active'
      case 'pending': return 'Pending'
      case 'suspended': return 'Suspended'
      case 'inactive': return 'Inactive'
      default: return status
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Customer': return 'var(--primary-color)'
      case 'Producer': return 'var(--highlight-color)'
      case 'Admin': return 'var(--accent-color)'
      default: return 'var(--secondary-color)'
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleApproveUser = async (user) => {
    setSelectedUser(user)
    setShowApproveModal(true)
  }

  const handleSuspendUser = (user) => {
    setSelectedUser(user)
    setShowSuspendModal(true)
  }

  const handleRejectUser = async (user) => {
    const reason = document.getElementById('rejectReasonUser').value.trim()
    if (!reason) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      await adminAPI.users.updateUserStatus(user.id, 'rejected', reason)
      toast.success(`${user.name} has been rejected`)
      closeAllModals()
      await fetchUsers()
    } catch (error) {
      console.error('Failed to reject user:', error)
      toast.error('Failed to reject user')
    }
  }

  const handleReactivateUser = async (user) => {
    try {
      await adminAPI.users.updateUserStatus(user.id, 'active')
      toast.success(`${user.name} has been reactivated`)
      closeAllModals()
      await fetchUsers()
    } catch (error) {
      console.error('Failed to reactivate user:', error)
      toast.error('Failed to reactivate user')
    }
  }

  const handleArchiveUser = (user) => {
    setSelectedUser(user)
    setShowArchiveModal(true)
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
      secondary: {
        background: 'var(--secondary-color)',
        color: 'white',
        boxShadow: '0 2px 6px rgba(108, 117, 125, 0.3)',
        hoverBackground: '#545b62',
        hoverBoxShadow: '0 4px 10px rgba(108, 117, 125, 0.4)'
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

  // Use these in the modal confirm button(s):
  const confirmApproveUser = async () => {
    try {
      await adminAPI.users.approveUser(selectedUser.id)
      toast.success(`${selectedUser.name} has been approved and can now login`)
      closeAllModals()
      await fetchUsers()
    } catch (error) {
      console.error('Failed to approve user:', error)
      toast.error('Failed to approve user')
    }
  }
  const confirmRejectUser = async () => {
    const reason = document.getElementById('rejectReasonUser').value.trim()
    if (!reason) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      await adminAPI.users.rejectUser(selectedUser.id, reason)
      toast.success(`${selectedUser.name} has been rejected`)
      closeAllModals()
      await fetchUsers()
    } catch (error) {
      console.error('Failed to reject user:', error)
      toast.error('Failed to reject user')
    }
  }
  const confirmReactivateUser = async () => {
    try {
      await adminAPI.users.updateUserStatus(selectedUser.id, 'active')
      toast.success(`${selectedUser.name} has been reactivated`)
      closeAllModals()
      await fetchUsers()
    } catch (error) {
      console.error('Failed to reactivate user:', error)
      toast.error('Failed to reactivate user')
    }
  }

  return (
    <>
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading users...</span>
          </div>
          <span className="ms-3">Loading users...</span>
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
          {/* Customer Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Customers</div>
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
              </div>
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-change positive">Registered customers</div>
            </div>

        <div className="stat-card highlight">
          <div className="stat-header">
            <div className="stat-title">Active Customers</div>
            <div className="stat-icon">
              <i className="bi bi-person-check"></i>
            </div>
          </div>
          <div className="stat-value">{activeUsers}</div>
          <div className="stat-change positive">Currently active</div>
        </div>

        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-title">New This Month</div>
            <div className="stat-icon">
              <i className="bi bi-person-plus"></i>
            </div>
          </div>
          <div className="stat-value">{newThisMonth}</div>
          <div className="stat-change positive">New registrations</div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-header">
            <div className="stat-title">Suspended Users</div>
            <div className="stat-icon">
              <i className="bi bi-person-x"></i>
            </div>
          </div>
          <div className="stat-value">{suspendedUsers}</div>
          <div className="stat-change negative">Suspended accounts</div>
        </div>
      </div>

      {/* Users Management */}
      <div className="admin-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div id="datatableButtons" className="d-flex gap-2">
              {/* DataTables export buttons */}
              <button 
                className="btn btn-primary"
                onClick={() => copyToClipboard(filteredUsers)}
                title="Copy table data to clipboard"
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
              <button 
                className="btn btn-success"
                onClick={() => exportToExcel(filteredUsers, 'users_report')}
                title="Export to Excel"
              >
                <i className="bi bi-file-earmark-excel"></i> Excel
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => exportToCSV(filteredUsers, 'users_report')}
                title="Export to CSV"
              >
                <i className="bi bi-file-earmark-text"></i> CSV
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => exportToPDF(filteredUsers, 'users_report')}
                title="Export to PDF"
              >
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </button>
              <button 
                className="btn btn-info"
                onClick={() => printTable(filteredUsers)}
                title="Print table"
              >
                <i className="bi bi-printer"></i> Print
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search customers..."
                style={{ width: '250px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="btn-admin btn-admin-primary"
                style={{ 
                  padding: '12px 24px', 
                  fontWeight: '600', 
                  boxShadow: '0 2px 8px rgba(44, 133, 63, 0.3)', 
                  transition: 'all 0.3s ease' 
                }}
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle"></i>
                <span style={{ marginLeft: '6px' }}>Add New Customer</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Status Tabs */}
        <div className="user-tabs" style={{ margin: 0, borderBottom: '1px solid var(--admin-border)', background: 'white' }}>
          <div className="tab-navigation" style={{ display: 'flex', gap: 0, width: '100%' }}>
            <TabButton 
              status="all" 
              icon="bi-people" 
              label="All Users" 
              count={statusCounts.all}
              isActive={selectedStatus === 'all'}
              onClick={() => setSelectedStatus('all')}
            />
            <TabButton 
              status="active" 
              icon="bi-person-check" 
              label="Active" 
              count={statusCounts.active}
              isActive={selectedStatus === 'active'}
              onClick={() => setSelectedStatus('active')}
            />
            <TabButton 
              status="pending" 
              icon="bi-clock-history" 
              label="Pending" 
              count={statusCounts.pending}
              isActive={selectedStatus === 'pending'}
              onClick={() => setSelectedStatus('pending')}
            />
            <TabButton 
              status="suspended" 
              icon="bi-person-x" 
              label="Suspended" 
              count={statusCounts.suspended}
              isActive={selectedStatus === 'suspended'}
              onClick={() => setSelectedStatus('suspended')}
            />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <table className="admin-table table table-striped table-hover" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Active</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr 
                  key={user.id}
                  style={{ cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: getRoleColor(user.role),
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        {user.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{user.name || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>{user.phone || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>{user.location}</td>
                  <td>{user.orders}</td>
                  <td>₱{user.totalSpent.toLocaleString()}</td>
                  <td>{user.lastActive}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: '250px'
                    }}>
                      {/* Active users - different actions based on role/situation */}
                      {user.status === 'active' && user.id === 1 && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Update Account"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction(user, 'edit')
                            }}
                          >
                            Update
                          </ActionButton>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-check-circle"
                            title="Approve Account"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction(user, 'activate')
                            }}
                          >
                            Approve
                          </ActionButton>
                          <ActionButton
                            variant="warning"
                            icon="bi bi-archive"
                            title="Archive Account"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction(user, 'archive')
                            }}
                          >
                            Archive
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Active users - standard actions */}
                      {user.status === 'active' && user.id !== 1 && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Edit User"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditUser(user)
                            }}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="secondary"
                            icon="bi bi-pause-circle"
                            title="Suspend User"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSuspendUser(user)
                            }}
                          >
                            Suspend
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Pending users actions */}
                      {user.status === 'pending' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-check-circle"
                            title="Approve User"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction(user, 'activate')
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
                              handleUserAction(user, 'reject')
                            }}
                          >
                            Reject
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Suspended users actions */}
                      {user.status === 'suspended' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-play-circle"
                            title="Reactivate User"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction(user, 'reactivate')
                            }}
                          >
                            Reactivate
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Inactive users actions */}
                      {user.status === 'inactive' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-play-circle"
                            title="Reactivate User"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUserAction(user, 'reactivate')
                            }}
                          >
                            Reactivate
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedUsers.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--secondary-color)' 
            }}>
              <i className="bi bi-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination}
      </div>

      {/* Modals */}
      <AddUserModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(userData) => {
          console.log('Adding user:', userData)
          // Add user logic here
        }}
      />
      
      <EditUserModal 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={async (userId, userData) => {
          try {
            await adminAPI.users.updateUser(userId, userData, 'approved', 'customer')
            toast.success('User updated successfully')
            setShowEditModal(false)
            fetchUsers()
          } catch (error) {
            toast.error('Failed to update user')
          }
        }}
        user={selectedUser}
      />

      {/* Approve User Modal */}
      {showApproveModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Approve User Account</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to approve the user account for <strong>{`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</strong>?</p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle"></i>
                Once approved, the user will be able to access the platform and use its features.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-primary" 
                onClick={confirmApproveUser}
              >
                Approve User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject User Modal */}
      {showRejectModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Reject User Application</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reject the user application for <strong>{`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</strong>?</p>
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Please provide a reason for rejection..."
                  id="rejectReasonUser"
                  required
                />
              </div>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle"></i>
                This action will permanently reject the application. The user will be notified via email.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-danger" 
                onClick={confirmRejectUser}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Suspend User Account</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to suspend the user account for <strong>{`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</strong>?</p>
              <p>Suspended users will not be able to access the platform until reactivated.</p>
              <div className="form-group">
                <label>Suspension Reason *</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Please provide a reason for suspension..."
                  id="suspendReasonUser"
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
                  const reason = document.getElementById('suspendReasonUser').value.trim()
                  if (!reason) {
                    toast.error('Please provide a suspension reason')
                    return
                  }
                  try {
                    await adminAPI.users.suspendUser(selectedUser.id, reason)
                    toast.success(`${selectedUser.name} has been suspended`)
                    closeAllModals()
                    fetchUsers()
                  } catch (error) {
                    toast.error('Failed to suspend user')
                  }
                }}
              >
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate User Modal */}
      {showReactivateModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Reactivate User Account</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reactivate the account for <strong>{`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</strong>?</p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle"></i>
                This will restore their access to the platform and set their status to active.
                {selectedUser.status === 'suspended' && ' The user was previously suspended.'}
                {selectedUser.status === 'inactive' && ' The user account was previously inactive.'}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button 
                className="btn-admin btn-admin-primary" 
                onClick={confirmReactivateUser}
              >
                Reactivate User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive User Modal */}
      {showArchiveModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Archive User</h3>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeAllModals}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to archive <strong>{`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}</strong>?</p>
              <p>Archived users will be set to inactive status and their data will be preserved but inaccessible.</p>
              <div className="form-group">
                <label>Archive Reason (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Optional reason for archiving..."
                  id="archiveReason"
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
                  const reason = document.getElementById('archiveReason').value.trim() || null
                  try {
                    await adminAPI.users.archiveUser(selectedUser.id, reason)
                    toast.success(`${selectedUser.name} has been archived`)
                    closeAllModals()
                    fetchUsers()
                  } catch (error) {
                    toast.error('Failed to archive user')
                  }
                }}
              >
                Archive User
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </>
  )
}


