import { useState, useMemo, useEffect } from 'react'
import { adminAPI } from '../../services/adminAPI'
import { messagesAPI } from '../../services/messagesAPI'

const AdminMessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    specificUser: ''
  })

  // Reply form state
  const [replyForm, setReplyForm] = useState({
    subject: '',
    message: ''
  })
  
  const [sendingReply, setSendingReply] = useState(false)
  const [replyError, setReplyError] = useState(null)
  const [replySuccess, setReplySuccess] = useState(false)

  // Filter state
  const [messageTypeFilter, setMessageTypeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')

  // Users and sellers lists for dropdown
  const [usersList, setUsersList] = useState([])
  const [sellersList, setSellersList] = useState([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  
  // Message sending state
  const [sendingMessage, setSendingMessage] = useState(false)
  const [sendMessageError, setSendMessageError] = useState(null)
  const [sendMessageSuccess, setSendMessageSuccess] = useState(false)

  // Messages state
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)

  // Fetch messages on mount
  useEffect(() => {
    loadMessages()
  }, [])

  // Load messages from API
  const loadMessages = async () => {
    try {
      setLoadingMessages(true)
      const response = await messagesAPI.getConversations()
      
      // Admin messages API returns messages array directly
      const messagesData = response.messages || response.data?.messages || []
      
      // Transform backend messages to frontend format
      const transformedMessages = messagesData.map(msg => {
        const partnerName = msg.partner_name || 'Unknown'
        const partnerRole = msg.partner_role || 'Unknown'
        const isSent = msg.message_type === 'sent'
        const isReceived = msg.message_type === 'received'
        const isRead = parseInt(msg.is_read_status || msg.is_read || 0) === 1
        
        // Get initials for avatar
        const getInitials = (name) => {
          if (!name || name === 'Unknown') return 'U'
          const words = name.split(' ')
          if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase()
          }
          return name.charAt(0).toUpperCase()
        }

        // Format date
        const formatDate = (dateString) => {
          if (!dateString) return ''
          const date = new Date(dateString)
          const now = new Date()
          const diff = now - date
          
          if (diff < 60000) return 'Just now'
          if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
          if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
          if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
          return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        }

        // Get message preview (first 50 chars)
        const preview = (msg.message || msg.subject || '').substring(0, 50) + ((msg.message || msg.subject || '').length > 50 ? '...' : '')

        return {
          id: msg.id,
          type: isSent ? 'sent' : 'received',
          fromTo: {
            name: partnerName,
            role: partnerRole,
            avatar: getInitials(partnerName)
          },
          subject: msg.subject || '(No subject)',
          preview: preview,
          date: formatDate(msg.created_at),
          status: isRead ? 'read' : 'unread',
          content: msg.message || '',
          partner_id: msg.partner_id,
          partner_type: msg.partner_type,
          created_at: msg.created_at,
          original: msg
        }
      })

      setMessages(transformedMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const filteredMessages = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      // If no search term, return all messages filtered by tab only
      return messages.filter(message => {
        return activeTab === 'all' || message.type === activeTab
      })
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    let filtered = messages.filter(message => {
      // Only search by recipient name (fromTo.name)
      const recipientName = message.fromTo?.name || ''
      const matchesSearch = recipientName.toLowerCase().includes(searchLower)
      
      const matchesTab = activeTab === 'all' || message.type === activeTab
      
      return matchesSearch && matchesTab
    })
    
    return filtered
  }, [messages, searchTerm, activeTab])

  const statusCounts = useMemo(() => ({
    all: messages.length,
    received: messages.filter(m => m.type === 'received').length,
    sent: messages.filter(m => m.type === 'sent').length,
    archived: messages.filter(m => m.type === 'archived').length
  }), [messages])

  const handleMessageAction = (message, action) => {
    setSelectedMessage(message)
    switch(action) {
      case 'reply':
        // Pre-fill reply form with subject
        setReplyForm({
          subject: message.subject ? `Re: ${message.subject}` : 'Re: Message',
          message: ''
        })
        setShowReplyModal(true)
        break
      case 'archive':
        setShowArchiveModal(true)
        break
      case 'unarchive':
        setShowUnarchiveModal(true)
        break
    }
  }

  // Handle sending reply
  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!selectedMessage || sendingReply) return

    setReplyError(null)
    setReplySuccess(false)
    setSendingReply(true)

    try {
      // Determine receiver based on message type
      let receiverId = selectedMessage.partner_id
      let receiverType = selectedMessage.partner_type || 'user'
      
      // If it's a received message, reply to the sender
      // If it's a sent message, this shouldn't happen, but handle it anyway
      if (selectedMessage.type === 'received') {
        receiverId = selectedMessage.partner_id
        receiverType = selectedMessage.partner_type
      } else {
        // For sent messages, we'd need the original receiver
        receiverId = selectedMessage.original?.receiver_id || selectedMessage.partner_id
        receiverType = selectedMessage.original?.receiver_type || selectedMessage.partner_type
      }

      await messagesAPI.sendMessage({
        receiver_id: parseInt(receiverId, 10),
        receiver_type: receiverType,
        subject: replyForm.subject,
        message: replyForm.message,
        parent_message_id: selectedMessage.id
      })

      setReplySuccess(true)
      
      // Refresh messages
      await loadMessages()
      
      // Close modal after 2 seconds
      setTimeout(() => {
        closeAllModals()
      }, 2000)
    } catch (error) {
      console.error('Failed to send reply:', error)
      setReplyError(error.message || 'Failed to send reply. Please try again.')
    } finally {
      setSendingReply(false)
    }
  }

  const closeAllModals = () => {
    setShowComposeModal(false)
    setShowReplyModal(false)
    setShowArchiveModal(false)
    setShowUnarchiveModal(false)
    setSelectedMessage(null)
    setComposeForm({ recipient: '', subject: '', message: '', specificUser: '' })
    setReplyForm({ subject: '', message: '' })
    // Reset recipients lists and loading state to fetch fresh data next time modal opens
    setUsersList([])
    setSellersList([])
    setLoadingRecipients(false)
    // Reset message sending states
    setSendingMessage(false)
    setSendMessageError(null)
    setSendMessageSuccess(false)
    setSendingReply(false)
    setReplyError(null)
    setReplySuccess(false)
  }

  // Fetch active users and verified sellers when compose modal opens
  useEffect(() => {
    if (!showComposeModal) {
      return // Don't fetch if modal is closed
    }

    let isCancelled = false

    const fetchRecipients = async () => {
      setLoadingRecipients(true)
      try {
        // Fetch active users/customers
        const usersResponse = await adminAPI.users.getAllUsers({
          role: 'customer',
          status: 'active',
          limit: 1000
        })
        const usersData = usersResponse.data?.users || usersResponse.users || []
        
        // Fetch verified sellers
        const sellersResponse = await adminAPI.sellers.getAll({
          verification_status: 'verified',
          limit: 1000
        })
        const sellersData = sellersResponse.data?.sellers || sellersResponse.sellers || []

        if (!isCancelled) {
          setUsersList(usersData)
          setSellersList(sellersData)
          console.log('✅ Loaded recipients:', { users: usersData.length, sellers: sellersData.length })
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('❌ Failed to fetch recipients:', error)
        }
      } finally {
        if (!isCancelled) {
          setLoadingRecipients(false)
        }
      }
    }

    fetchRecipients()

    return () => {
      isCancelled = true
    }
  }, [showComposeModal])

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    setSendMessageError(null)
    setSendMessageSuccess(false)

    // Validate form
    if (!composeForm.recipient || !composeForm.subject || !composeForm.message.trim()) {
      setSendMessageError('Please fill in all required fields')
      return
    }

    if (composeForm.recipient === 'specific' && !composeForm.specificUser) {
      setSendMessageError('Please select a specific user')
      return
    }

    setSendingMessage(true)

    try {
      let recipients = []

      // Determine recipients based on selection
      if (composeForm.recipient === 'specific') {
        // Parse specific user (format: "user-123" or "seller-123")
        const [type, id] = composeForm.specificUser.split('-')
        if (type === 'user') {
          recipients.push({ id: parseInt(id), type: 'user' })
        } else if (type === 'seller') {
          recipients.push({ id: parseInt(id), type: 'seller' })
        }
      } else if (composeForm.recipient === 'all-users' || composeForm.recipient === 'all-customers') {
        // Send to all active users
        if (usersList.length === 0) {
          // Fetch users if not already loaded
          const usersResponse = await adminAPI.users.getAllUsers({
            role: 'customer',
            status: 'active',
            limit: 1000
          })
          const usersData = usersResponse.data?.users || usersResponse.users || []
          recipients = usersData.map(user => ({ id: user.id, type: 'user' }))
        } else {
          recipients = usersList.map(user => ({ id: user.id, type: 'user' }))
        }
      } else if (composeForm.recipient === 'all-producers') {
        // Send to all verified sellers
        if (sellersList.length === 0) {
          // Fetch sellers if not already loaded
          const sellersResponse = await adminAPI.sellers.getAll({
            verification_status: 'verified',
            limit: 1000
          })
          const sellersData = sellersResponse.data?.sellers || sellersResponse.sellers || []
          recipients = sellersData.map(seller => ({ id: seller.id, type: 'seller' }))
        } else {
          recipients = sellersList.map(seller => ({ id: seller.id, type: 'seller' }))
        }
      }

      if (recipients.length === 0) {
        setSendMessageError('No recipients found')
        setSendingMessage(false)
        return
      }

      // Send message to each recipient
      const sendPromises = recipients.map(recipient => 
        messagesAPI.sendMessage({
          receiver_id: recipient.id,
          receiver_type: recipient.type,
          subject: composeForm.subject,
          message: composeForm.message
        })
      )

      await Promise.all(sendPromises)
      
      setSendMessageSuccess(true)
      console.log(`✅ Message sent to ${recipients.length} recipient(s)`)
      
      // Refresh messages after sending
      await loadMessages()
      
      // Close modal after 2 seconds
      setTimeout(() => {
        closeAllModals()
      }, 2000)
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      setSendMessageError(error.message || 'Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  // Reusable ActionButton component for consistent styling
  const ActionButton = ({ variant = 'primary', icon, children, onClick, title, ...props }) => {
    const variants = {
      primary: {
        background: 'var(--primary-color)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(44, 133, 63, 0.3)',
        hoverBackground: '#1e6b3e',
        hoverBoxShadow: '0 4px 12px rgba(44, 133, 63, 0.4)'
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
        boxShadow: '0 2px 6px rgba(108, 117, 125, 0.2)',
        hoverBackground: '#545b62',
        hoverBoxShadow: '0 4px 10px rgba(108, 117, 125, 0.3)'
      }
    }

    const style = variants[variant] || variants.primary

    return (
      <button
        title={title}
        onClick={onClick}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: '6px',
          background: style.background,
          color: style.color,
          boxShadow: style.boxShadow || 'none',
          fontWeight: 600,
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
        {...props}
      >
        <i className={icon}></i>
        <span style={{ marginLeft: '4px' }}>{children}</span>
      </button>
    )
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      unread: { class: 'status-pending', text: 'Unread' },
      read: { class: 'status-active', text: 'Read' }
    }
    const statusInfo = statusMap[status] || statusMap.read
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>
  }

  const getTypeBadge = (type) => {
    const typeMap = {
      received: { class: 'status-active', text: 'Received' },
      sent: { class: 'status-secondary', text: 'Sent' },
      archived: { class: 'status-inactive', text: 'Archived' }
    }
    const typeInfo = typeMap[type] || typeMap.received
    return <span className={`status-badge ${typeInfo.class}`}>{typeInfo.text}</span>
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

  const MessageAvatar = ({ message }) => (
    <div style={{
      width: '32px',
      height: '32px',
      backgroundColor: 'var(--primary-color)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 600,
      fontSize: '12px'
    }}>
      {message.fromTo.avatar}
    </div>
  )

  return (
    <>
      {/* Message Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Messages</div>
            <div className="stat-icon">
              <i className="bi bi-chat-dots"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.all}</div>
          <div className="stat-change positive">All messages</div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-header">
            <div className="stat-title">Received Messages</div>
            <div className="stat-icon">
              <i className="bi bi-inbox"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.received}</div>
          <div className="stat-change positive">Incoming messages</div>
        </div>

        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-title">Sent Messages</div>
            <div className="stat-icon">
              <i className="bi bi-send"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.sent}</div>
          <div className="stat-change positive">Outgoing messages</div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-header">
            <div className="stat-title">Archived Messages</div>
            <div className="stat-icon">
              <i className="bi bi-archive"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.archived}</div>
          <div className="stat-change neutral">Archived messages</div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="admin-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex gap-2"></div>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="search"
                className="form-control"
                placeholder="Search by recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '250px' }}
              />
              <button
                className="btn-admin btn-admin-primary"
                onClick={() => setShowComposeModal(true)}
                style={{
                  padding: '12px 24px',
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
                <i className="bi bi-plus-circle"></i>
                New Message
              </button>
            </div>
          </div>
        </div>

        {/* Message Status Tabs */}
        <div className="message-tabs" style={{
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
              icon="bi bi-chat-dots"
            >
              All Messages
            </TabButton>
            <TabButton 
              status="received" 
              count={statusCounts.received}
              icon="bi bi-inbox"
            >
              Received
            </TabButton>
            <TabButton 
              status="sent" 
              count={statusCounts.sent}
              icon="bi bi-send"
            >
              Sent
            </TabButton>
            <TabButton 
              status="archived" 
              count={statusCounts.archived}
              icon="bi bi-archive"
            >
              Archived
            </TabButton>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loadingMessages ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner-border spinner-border-sm text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading messages...</p>
            </div>
          ) : (
            <table className="admin-table table table-striped table-hover" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From/To</th>
                  <th>Subject</th>
                  <th>Message Preview</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                <tr 
                  key={message.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => console.log(`Navigate to message details ${message.id}`)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <td>{getTypeBadge(message.type)}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <MessageAvatar message={message} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{message.fromTo.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                          {message.fromTo.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: message.status === 'unread' ? 600 : 'normal' }}>
                    {message.subject}
                  </td>
                  <td style={{ 
                    maxWidth: '200px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {message.preview}
                  </td>
                  <td>{message.date}</td>
                  <td>{getStatusBadge(message.status)}</td>
                  <td>
                    <div className="action-buttons" style={{ 
                      display: 'flex', 
                      gap: '6px',
                      justifyContent: 'flex-start',
                      alignItems: 'center'
                    }}>
                      {/* Received messages: Reply + Archive */}
                      {message.type === 'received' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-reply"
                            title="Reply Message"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMessageAction(message, 'reply')
                            }}
                          >
                            Reply
                          </ActionButton>
                          <ActionButton
                            variant="warning"
                            icon="bi bi-archive"
                            title="Archive Message"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMessageAction(message, 'archive')
                            }}
                          >
                            Archive
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Sent messages: Archive only */}
                      {message.type === 'sent' && (
                        <ActionButton
                          variant="warning"
                          icon="bi bi-archive"
                          title="Archive Message"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMessageAction(message, 'archive')
                          }}
                        >
                          Archive
                        </ActionButton>
                      )}
                      
                      {/* Archived messages: Unarchive only */}
                      {message.type === 'archived' && (
                        <ActionButton
                          variant="secondary"
                          icon="bi bi-arrow-counterclockwise"
                          title="Unarchive Message"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMessageAction(message, 'unarchive')
                          }}
                        >
                          Unarchive
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}

          {!loadingMessages && filteredMessages.length === 0 && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: 'var(--secondary-color)' 
            }}>
              <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <div>
                {searchTerm 
                  ? `No messages found matching "${searchTerm}"`
                  : messages.length === 0 
                    ? 'No messages yet. Start by sending a message!'
                    : `No ${activeTab === 'all' ? '' : activeTab} messages found.`
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showComposeModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Compose New Message</h5>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSendMessage}>
                <div className="form-group">
                  <label>To *</label>
                  <select 
                    className="form-control" 
                    value={composeForm.recipient}
                    onChange={(e) => setComposeForm({...composeForm, recipient: e.target.value})}
                    required
                  >
                    <option value="">Select recipient...</option>
                    <option value="all-users">All Users</option>
                    <option value="all-producers">All Producers</option>
                    <option value="all-customers">All Customers</option>
                    <option value="specific">Specific User</option>
                  </select>
                </div>
                
                {composeForm.recipient === 'specific' && (
                  <div className="form-group">
                    <label>Specific User *</label>
                    {loadingRecipients ? (
                      <div className="form-control" style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                        <i className="bi bi-hourglass-split"></i> Loading users...
                      </div>
                    ) : (
                      <select 
                        className="form-control"
                        value={composeForm.specificUser}
                        onChange={(e) => setComposeForm({...composeForm, specificUser: e.target.value})}
                        required={composeForm.recipient === 'specific'}
                      >
                        <option value="">Select a user...</option>
                        
                        {/* Active Customers */}
                        {usersList.length > 0 && (
                          <optgroup label="Active Customers">
                            {usersList.map((user) => (
                              <option key={`user-${user.id}`} value={`user-${user.id}`}>
                                {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email} - {user.email} {user.phone ? `(${user.phone})` : ''}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        
                        {/* Verified Sellers */}
                        {sellersList.length > 0 && (
                          <optgroup label="Verified Sellers">
                            {sellersList.map((seller) => (
                              <option key={`seller-${seller.id}`} value={`seller-${seller.id}`}>
                                {seller.business_name || seller.owner_name || seller.email} - {seller.email} {seller.phone ? `(${seller.phone})` : ''}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        
                        {usersList.length === 0 && sellersList.length === 0 && (
                          <option value="" disabled>No users available</option>
                        )}
                      </select>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>Subject *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter message subject"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea 
                    className="form-control" 
                    rows="6" 
                    placeholder="Type your message here..."
                    value={composeForm.message}
                    onChange={(e) => setComposeForm({...composeForm, message: e.target.value})}
                    required
                  ></textarea>
                </div>

                {/* Error message */}
                {sendMessageError && (
                  <div className="alert alert-danger" style={{ marginTop: '15px' }}>
                    <i className="bi bi-exclamation-circle"></i> {sendMessageError}
                  </div>
                )}

                {/* Success message */}
                {sendMessageSuccess && (
                  <div className="alert alert-success" style={{ marginTop: '15px' }}>
                    <i className="bi bi-check-circle"></i> Message sent successfully!
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="btn-admin btn-admin-outline" 
                onClick={closeAllModals}
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-admin btn-admin-primary" 
                onClick={handleSendMessage}
                disabled={sendingMessage || sendMessageSuccess}
              >
                {sendingMessage ? (
                  <>
                    <i className="bi bi-hourglass-split"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Reply to {selectedMessage.fromTo.name}</h5>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <strong>Original Message:</strong>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <strong>Subject:</strong> {selectedMessage.subject}<br/>
                  <strong>From:</strong> {selectedMessage.fromTo.name}<br/>
                  <strong>Message:</strong> {selectedMessage.content}
                </div>
              </div>

              <form onSubmit={handleSendReply}>
                <div className="form-group">
                  <label>Subject *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={replyForm.subject}
                    onChange={(e) => setReplyForm({...replyForm, subject: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reply Message *</label>
                  <textarea 
                    className="form-control" 
                    rows="6" 
                    placeholder="Type your reply here..."
                    value={replyForm.message}
                    onChange={(e) => setReplyForm({...replyForm, message: e.target.value})}
                    required
                  ></textarea>
                </div>

                {/* Error message */}
                {replyError && (
                  <div className="alert alert-danger" style={{ marginTop: '15px' }}>
                    <i className="bi bi-exclamation-circle"></i> {replyError}
                  </div>
                )}

                {/* Success message */}
                {replySuccess && (
                  <div className="alert alert-success" style={{ marginTop: '15px' }}>
                    <i className="bi bi-check-circle"></i> Reply sent successfully!
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="btn-admin btn-admin-outline" 
                onClick={closeAllModals}
                disabled={sendingReply}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-admin btn-admin-primary" 
                onClick={handleSendReply}
                disabled={sendingReply || replySuccess}
              >
                {sendingReply ? (
                  <>
                    <i className="bi bi-hourglass-split"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-reply"></i>
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showArchiveModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Archive Message</h5>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to archive this message from <strong>{selectedMessage.fromTo.name}</strong>?</p>
              
              <div className="alert alert-info">
                <strong>Message Details:</strong>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <strong>Subject:</strong> {selectedMessage.subject}<br/>
                  <strong>Date:</strong> {selectedMessage.date}<br/>
                  <strong>Preview:</strong> {selectedMessage.preview}
                </div>
              </div>

              <div className="alert alert-warning">
                <i className="bi bi-info-circle"></i>
                Archived messages can be viewed in the Archived tab but won't appear in your main inbox.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button className="btn-admin btn-admin-warning" onClick={closeAllModals}>
                <i className="bi bi-archive"></i>
                Archive Message
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnarchiveModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Unarchive Message</h5>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to unarchive this message from <strong>{selectedMessage.fromTo.name}</strong>?</p>
              
              <div className="alert alert-info">
                <strong>Message Details:</strong>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <strong>Subject:</strong> {selectedMessage.subject}<br/>
                  <strong>Date:</strong> {selectedMessage.date}<br/>
                  <strong>Preview:</strong> {selectedMessage.preview}
                </div>
              </div>

              <div className="alert alert-warning">
                <i className="bi bi-info-circle"></i>
                Unarchiving this message will move it back to your main inbox and it will be marked as unread.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button className="btn-admin btn-admin-secondary" onClick={closeAllModals}>
                <i className="bi bi-arrow-counterclockwise"></i>
                Unarchive Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminMessagesPage


