import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { messagesAPI } from '../../services/messagesAPI'
import { toast } from 'react-hot-toast'

export default function UserChatPage() {
  const location = useLocation()
  const { state } = useAppState()
  const { isLoggedIn } = state
  
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

  // Refs
  const chatMessagesRef = useRef(null)
  const messageInputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Load conversations on mount
  useEffect(() => {
    if (isLoggedIn) {
      loadConversations()
    }
  }, [isLoggedIn])

  // Auto-select seller conversation if coming from product page
  useEffect(() => {
    if (location.state?.autoSelect && location.state?.sellerId && conversations.length > 0) {
      const sellerExists = conversations.find(conv => conv.seller_id === location.state.sellerId)
      if (sellerExists) {
        setActiveConversation(location.state.sellerId)
      }
    }
  }, [location.state, conversations])

  const markMessagesAsRead = async (sellerId) => {
    if (!sellerId) return
    
    try {
      await messagesAPI.markAsRead(sellerId, null)
      // Refresh conversations to update unread counts
      await loadConversations()
      // Dispatch event to update header unread count
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
  const currentConversation = conversations.find(conv => conv.seller_id === activeConversation)

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await messagesAPI.getConversations()
      
      if (response.conversations) {
        // Map backend data to frontend format
        const mappedConversations = response.conversations.map(conv => {
          // Check if conversation is with admin
          const isAdmin = conv.partner_type === 'admin'
          const displayName = isAdmin ? 'Admin Support' : (conv.seller_name || conv.seller_owner_name || 'Seller')
          const avatarName = isAdmin ? 'Admin Support' : (conv.seller_name || conv.seller_owner_name || 'Seller')
          
          return {
            seller_id: conv.seller_id,
            name: displayName,
            ownerName: conv.seller_owner_name,
            avatar: getInitials(avatarName),
            lastMessage: conv.last_message || 'No messages yet',
            lastMessageTime: formatTime(conv.last_message_time),
            unreadCount: parseInt(conv.unread_count) || 0,
            status: 'offline', // Can be enhanced later with real-time status
            partner_type: conv.partner_type || 'seller'
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

  const loadMessages = async (sellerId) => {
    if (!sellerId) return
    
    try {
      setLoadingMessages(true)
      const response = await messagesAPI.getMessages(sellerId)
      
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

  const getInitials = (name) => {
    if (!name) return 'S'
    const words = name.split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
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
    const sellerId = currentConversation.seller_id
    const partnerType = currentConversation.partner_type || 'seller'
    
    try {
      setSending(true)
      
      const messageData = {
        receiver_id: parseInt(sellerId, 10),
        receiver_type: partnerType === 'admin' ? 'admin' : 'seller',
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
  const handleConversationSelect = (sellerId) => {
    setActiveConversation(sellerId)
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
    <div style={{ marginTop: '90px', padding: '1rem', minHeight: 'calc(100vh - 90px)' }}>
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
                  key={conversation.seller_id}
                  className={`conversation-item ${activeConversation === conversation.seller_id ? 'active' : ''}`}
                  onClick={() => handleConversationSelect(conversation.seller_id)}
                >
                  <div className="seller-avatar">{conversation.avatar}</div>
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
                  <div className="seller-avatar me-3">{currentConversation.avatar}</div>
                  <div>
                    <h6 className="mb-0">{currentConversation.name}</h6>
                    <small className={getStatusClass(currentConversation.status)}>
                      <i className="bi bi-circle-fill" style={{fontSize: '0.5rem'}}></i>
                      {' '}{getStatusText(currentConversation.status)}
                    </small>
                  </div>
                </div>
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
                    const isFromUser = message.sender_type === 'user'
                    return (
                      <div 
                        key={message.id}
                        className={`message-bubble ${isFromUser ? 'sent' : 'received'}`}
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
              <p className="text-muted">Choose a seller from the list to view your conversation history</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .messages-layout {
          display: flex !important;
          height: calc(100vh - 180px);
          gap: 1rem;
          width: 100%;
        }
        
        .messages-sidebar {
          width: 320px !important;
          min-width: 320px !important;
          max-width: 320px !important;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          display: flex !important;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          flex-shrink: 0;
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
        
        .seller-avatar {
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
        
        .btn-seller:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        @media (max-width: 768px) {
          .messages-layout {
            flex-direction: column;
            height: auto;
          }
          
          .messages-sidebar {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            height: 300px;
          }
          
          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  )
}
