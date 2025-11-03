import { useState, useRef, useEffect } from 'react'
import {
  CustomerDetailsModal,
  OrderQuickLookModal
} from '../../components/SellerModals'
import QuickTemplatesModal from '../../components/SellerModals/SellerMessagesPage/QuickTemplatesModal'
import { messagesAPI } from '../../services/messagesAPI'
import { toast } from 'react-hot-toast'

export default function SellerMessagesPage() {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const [activeConversation, setActiveConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageFilter, setMessageFilter] = useState('all')
  const [messageInput, setMessageInput] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  // Modal states
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false)
  const [showOrderQuickLookModal, setShowOrderQuickLookModal] = useState(false)
  const [showQuickTemplatesModal, setShowQuickTemplatesModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Refs
  const chatMessagesRef = useRef(null)
  const messageInputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const markMessagesAsRead = async (customerId) => {
    if (!customerId) return
    
    try {
      await messagesAPI.markAsRead(null, customerId)
      // Refresh conversations to update unread counts
      await loadConversations()
      // Dispatch event to update header unread count (if seller has header badge)
      window.dispatchEvent(new Event('messagesUpdated'))
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
      // Don't show error to user, just log it
    }
  }

  // Load messages when conversation is selected
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation)
      // Mark messages as read when conversation is opened
      markMessagesAsRead(activeConversation)
    } else {
      setMessages([])
    }
  }, [activeConversation])

  // Get current conversation
  const currentConversation = conversations.find(conv => conv.customer_id === activeConversation)

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await messagesAPI.getConversations()
      
      if (response.conversations) {
        // Map backend data to frontend format
        const mappedConversations = response.conversations.map(conv => {
          // Check if conversation is with admin
          const isAdmin = conv.partner_type === 'admin'
          const displayName = isAdmin ? 'Admin Support' : (conv.customer_first_name && conv.customer_last_name
            ? `${conv.customer_first_name} ${conv.customer_last_name}`
            : 'Customer')
          const avatarName = isAdmin ? 'Admin Support' : (conv.customer_first_name && conv.customer_last_name
            ? `${conv.customer_first_name} ${conv.customer_last_name}`
            : 'Customer')
          
          return {
            customer_id: conv.customer_id,
            name: displayName,
            avatar: getInitials(isAdmin ? 'Admin Support' : conv.customer_first_name, isAdmin ? '' : conv.customer_last_name),
            lastMessage: conv.last_message || 'No messages yet',
            lastMessageTime: formatTime(conv.last_message_time),
            unreadCount: parseInt(conv.unread_count) || 0,
            status: 'offline', // Can be enhanced later with real-time status
            partner_type: conv.partner_type || 'user'
          }
        })
        
        setConversations(mappedConversations)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      toast.error('Failed to load conversations')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (customerId) => {
    if (!customerId) return
    
    try {
      setLoadingMessages(true)
      const response = await messagesAPI.getMessages(null, customerId)
      
      if (response.messages) {
        setMessages(response.messages)
        // Auto-scroll to bottom after messages load
        setTimeout(() => {
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
          }
        }, 100)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load messages')
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    // Handle "Admin Support" case
    if (firstName === 'Admin Support') {
      return 'AS'
    }
    const first = firstName ? firstName.charAt(0).toUpperCase() : 'C'
    const last = lastName ? lastName.charAt(0).toUpperCase() : ''
    return first + last
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    // Just now
    if (diff < 60000) return 'Just now'
    
    // Minutes ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}m ago`
    }
    
    // Hours ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}h ago`
    }
    
    // Days ago
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days}d ago`
    }
    
    // Date format
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = messageFilter === 'all' || 
                         (messageFilter === 'unread' && conv.unreadCount > 0)
    return matchesSearch && matchesFilter
  })

  // Calculate counts
  const totalConversations = conversations.length
  const unreadConversations = conversations.filter(conv => conv.unreadCount > 0).length

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current && messages.length > 0) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setMessageInput(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  // Handle Enter key for sending messages
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Send message function
  const sendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !currentConversation || sending) return
    
    const messageText = messageInput.trim()
    const customerId = currentConversation.customer_id
    const partnerType = currentConversation.partner_type || 'user'
    
    try {
      setSending(true)
      
      const messageData = {
        receiver_id: parseInt(customerId, 10),
        receiver_type: partnerType === 'admin' ? 'admin' : 'user',
        message: messageText || '' // Allow empty message if image is attached
      }
      
      if (selectedImage) {
        messageData.image = selectedImage
      }
      
      const response = await messagesAPI.sendMessage(messageData)
      
      if (response.message) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, response.message])
        
        // Clear input and image
        setMessageInput('')
        setSelectedImage(null)
        setImagePreview(null)
        if (messageInputRef.current) {
          messageInputRef.current.style.height = 'auto'
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Auto-scroll to bottom
        setTimeout(() => {
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
          }
        }, 100)
        
        // Refresh conversations to update last message
        loadConversations()
        
        // Dispatch event to update header unread count
        window.dispatchEvent(new Event('messagesUpdated'))
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (customerId) => {
    setActiveConversation(customerId)
  }

  // Handle customer details modal
  const handleShowCustomerDetails = () => {
    if (currentConversation) {
      setSelectedCustomer({
        id: currentConversation.customer_id,
        name: currentConversation.name,
        initials: currentConversation.avatar,
        status: currentConversation.status
      })
      setShowCustomerDetailsModal(true)
    }
  }

  // Handle order quick look modal
  const handleShowOrderQuickLook = () => {
    if (currentConversation) {
      // Create a mock order for the selected customer
      const mockOrder = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        status: 'delivered',
        paymentStatus: 'paid',
        createdAt: '2024-10-06T10:30:00Z',
        paymentMethod: 'GCash',
        transactionId: 'TXN' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        shippingFee: 50,
        tax: 12,
        customer: {
          name: currentConversation.name,
          email: currentConversation.name.toLowerCase().replace(' ', '.') + '@email.com',
          phone: '+63 912 345 6789'
        },
        shippingAddress: {
          fullAddress: '123 Main St, Barangay Centro',
          city: 'Naga City',
          postalCode: '4400'
        },
        items: [
          {
            name: 'Fresh Rice (5kg)',
            price: 250,
            quantity: 2,
            image: '/images/rice.jpg'
          },
          {
            name: 'Organic Vegetables Bundle',
            price: 180,
            quantity: 1,
            image: '/images/vegetables.jpg'
          }
        ],
        trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 10).toUpperCase(),
        carrier: 'J&T Express'
      }
      
      setSelectedCustomer(mockOrder)
      setShowOrderQuickLookModal(true)
    }
  }

  // Handle view full order
  const handleViewFullOrder = (order) => {
    console.log('Opening full order view for:', order.id)
    // In a real app, this would navigate to the full order page
    alert(`Opening full order view for Order #${order.id}`)
    setShowOrderQuickLookModal(false)
  }

  // Get status class
  const getStatusClass = (status) => {
    return {
      online: 'text-success',
      away: 'text-warning',
      offline: 'text-muted'
    }[status] || 'text-muted'
  }

  // Get status text
  const getStatusText = (status) => {
    return {
      online: 'Online',
      away: 'Away',
      offline: 'Offline'
    }[status] || 'Offline'
  }

  return (
    <div className="seller-content p-4">
      {/* Messages Layout */}
      <div className="messages-layout">
        {/* Messages Sidebar */}
        <div className="messages-sidebar">
          {/* Search */}
          <div className="conversation-search">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="conversation-tabs">
            <ul className="nav nav-tabs nav-fill">
              <li className="nav-item">
                <button 
                  className={`nav-link ${messageFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('all')}
                >
                  All ({totalConversations})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${messageFilter === 'unread' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('unread')}
                >
                  Unread ({unreadConversations})
                </button>
              </li>
            </ul>
          </div>
          
          {/* Conversation List */}
          <div className="conversation-list">
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 small">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-4">
                <i className="bi bi-inbox fs-1 text-muted mb-2"></i>
                <p className="text-muted small">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div 
                  key={conversation.customer_id}
                  className={`conversation-item ${activeConversation === conversation.customer_id ? 'active' : ''}`}
                  onClick={() => handleConversationSelect(conversation.customer_id)}
                >
                  <div className="customer-avatar">{conversation.avatar}</div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-0">{conversation.name}</h6>
                      <small className="text-muted">{conversation.lastMessageTime}</small>
                    </div>
                    <p className="mb-0 text-muted small" style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">{conversation.unreadCount}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="messages-main">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="d-flex align-items-center flex-grow-1">
                  <div className="customer-avatar me-3">{currentConversation.avatar}</div>
                  <div>
                    <h6 className="mb-0">{currentConversation.name}</h6>
                    <small className={getStatusClass(currentConversation.status)}>
                      <i className="bi bi-circle-fill" style={{fontSize: '0.5rem'}}></i>
                      {' '}{getStatusText(currentConversation.status)}
                    </small>
                  </div>
                </div>
                {currentConversation.partner_type !== 'admin' && (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleShowCustomerDetails}
                    >
                      <i className="bi bi-person"></i>
                      Details
                    </button>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleShowOrderQuickLook}
                    >
                      <i className="bi bi-cart"></i>
                      Orders
                    </button>
                  </div>
                )}
              </div>
              
              {/* Chat Body */}
              <div className="chat-body" ref={chatMessagesRef}>
                {loadingMessages ? (
                  <div className="text-center p-4">
                    <div className="spinner-border spinner-border-sm text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-4">
                    <i className="bi bi-chat-dots fs-1 text-muted mb-2"></i>
                    <p className="text-muted">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isFromSeller = message.sender_type === 'seller'
                    return (
                      <div 
                        key={message.id}
                        className={`message-bubble ${isFromSeller ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          {message.subject && (
                            <div className="mb-1" style={{ fontSize: '0.85em', opacity: 0.9 }}>
                              <strong>{message.subject}</strong>
                            </div>
                          )}
                          {message.attachment_url && (
                            <div className="mb-2" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                              <img 
                                src={`http://localhost:8080/S2EH/s2e-backend${message.attachment_url}`}
                                alt="Attachment"
                                style={{ 
                                  maxWidth: '300px', 
                                  maxHeight: '300px',
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: '8px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  window.open(`http://localhost:8080/S2EH/s2e-backend${message.attachment_url}`, '_blank')
                                }}
                              />
                            </div>
                          )}
                          {message.message && (
                            <div>{message.message}</div>
                          )}
                        </div>
                        <div className="message-time">{formatTime(message.created_at)}</div>
                      </div>
                    )
                  })
                )}
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview-container" style={{ 
                  padding: '10px 15px', 
                  borderTop: '1px solid #e0e0e0',
                  background: '#f8f9fa'
                }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }} 
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={removeSelectedImage}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Chat Footer */}
              <div className="chat-footer">
                <div className="message-input-group">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    title="Attach Photo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="bi bi-image"></i>
                  </button>
                  <button 
                    className="btn btn-outline-secondary" 
                    title="Quick Templates"
                    onClick={() => setShowQuickTemplatesModal(true)}
                  >
                    <i className="bi bi-lightning"></i>
                  </button>
                  <textarea 
                    ref={messageInputRef}
                    className="message-input" 
                    placeholder="Type your message..." 
                    rows="1"
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                  <button 
                    className="btn-seller" 
                    onClick={sendMessage}
                    disabled={sending || (!messageInput.trim() && !selectedImage)}
                  >
                    {sending ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Sending...</span>
                      </div>
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Select a conversation to start messaging</h5>
              <p className="text-muted">Choose a conversation from the list to view your message history</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .messages-layout {
          display: flex;
          height: calc(100vh - 200px);
          gap: 1rem;
        }
        
        .messages-sidebar {
          width: 320px;
          min-width: 320px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .messages-main {
          flex: 1;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .conversation-search {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .conversation-tabs {
          padding: 0 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .conversation-tabs .nav-link {
          color: #666;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 0.75rem 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          background: none;
        }
        
        .conversation-tabs .nav-link.active {
          color: #2e7d32;
          border-bottom-color: #2e7d32;
          background: none;
        }
        
        .conversation-tabs .nav-link:hover {
          color: #2e7d32;
          background: none;
          border-color: transparent;
        }
        
        .conversation-list {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }
        
        .conversation-item {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .conversation-item:hover {
          background-color: #f8f9fa;
        }
        
        .conversation-item.active {
          background-color: #e3f2fd;
          border-right: 3px solid #2e7d32;
        }
        
        .conversation-item .unread-badge {
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
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
        
        .chat-header {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: #f8f9fa;
        }
        
        .chat-body {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          background: #f8f9fa;
        }
        
        .chat-footer {
          padding: 1rem;
          border-top: 1px solid #e0e0e0;
          background: white;
        }
        
        .message-bubble {
          max-width: 70%;
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          position: relative;
        }
        
        .message-bubble.received {
          background: white;
          border: 1px solid #e0e0e0;
          margin-right: auto;
        }
        
        .message-bubble.sent {
          background: #2e7d32;
          color: white;
          margin-left: auto;
        }
        
        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.25rem;
        }
        
        .message-input-group {
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;
        }
        
        .message-input {
          flex: 1;
          border: 2px solid #e9ecef;
          border-radius: 20px;
          padding: 0.75rem 1rem;
          resize: none;
          max-height: 100px;
          font-family: inherit;
          transition: border-color 0.3s ease;
        }
        
        .message-input:focus {
          outline: none;
          border-color: #2e7d32;
          box-shadow: 0 0 0 0.2rem rgba(46, 125, 50, 0.15);
        }
        
        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          text-align: center;
          padding: 2rem;
        }
        
        .btn-seller {
          background-color: #2e7d32;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 50%;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
        }
        
        .btn-seller:hover {
          background-color: #1b5e20;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
        }
        
        .btn-outline-secondary {
          border: 1px solid #e9ecef;
          color: #6c757d;
          background: white;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-outline-secondary:hover {
          background: #2e7d32;
          border-color: #2e7d32;
          color: white;
        }
        
        .btn-outline-primary {
          border: 1px solid #2e7d32;
          color: #2e7d32;
          background: white;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-outline-primary:hover {
          background: #2e7d32;
          border-color: #2e7d32;
          color: white;
        }

        @media (max-width: 768px) {
          .messages-layout {
            flex-direction: column;
            height: auto;
          }
          
          .messages-sidebar {
            width: 100%;
            min-width: auto;
            height: 300px;
          }
          
          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>

      {/* Message Modals */}
      <CustomerDetailsModal
        show={showCustomerDetailsModal}
        onClose={() => setShowCustomerDetailsModal(false)}
        customer={selectedCustomer}
      />

      <OrderQuickLookModal
        show={showOrderQuickLookModal}
        onClose={() => setShowOrderQuickLookModal(false)}
        order={selectedCustomer}
        onViewFullOrder={handleViewFullOrder}
      />

      <QuickTemplatesModal
        show={showQuickTemplatesModal}
        onClose={() => setShowQuickTemplatesModal(false)}
        onSelectTemplate={(template) => {
          setMessageInput(template)
          setShowQuickTemplatesModal(false)
          if (messageInputRef.current) {
            messageInputRef.current.focus()
          }
        }}
      />
    </div>
  )
}


