import { useState, useRef, useEffect } from 'react'
import {
  CustomerDetailsModal,
  OrderQuickLookModal
} from '../../components/SellerModals'
import QuickTemplatesModal from '../../components/SellerModals/SellerMessagesPage/QuickTemplatesModal'

export default function SellerMessagesPage() {
  // Sample conversations data matching messages.html
  const [conversations] = useState([])

  const [activeConversation, setActiveConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageFilter, setMessageFilter] = useState('all')
  const [messageInput, setMessageInput] = useState('')
  
  // Modal states
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false)
  const [showOrderQuickLookModal, setShowOrderQuickLookModal] = useState(false)
  const [showQuickTemplatesModal, setShowQuickTemplatesModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Refs
  const chatMessagesRef = useRef(null)
  const messageInputRef = useRef(null)

  // Get current conversation
  const currentConversation = conversations.find(conv => conv.id === activeConversation)

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
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [currentConversation?.messages])

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

  // Send message function
  const sendMessage = () => {
    if (messageInput.trim() && currentConversation) {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      
      // In real app, this would be handled by state management (Redux, Context, etc.)
      // For now, we'll just clear the input and show feedback
      console.log('Sending message:', messageInput, 'to:', currentConversation.name)
      
      setMessageInput('')
      if (messageInputRef.current) {
        messageInputRef.current.style.height = 'auto'
      }
      
      // Here you would typically dispatch an action to send the message
      alert(`Message sent to ${currentConversation.name}: "${messageInput}"`)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (conversationId) => {
    setActiveConversation(conversationId)
  }

  // Handle customer details modal
  const handleShowCustomerDetails = () => {
    if (currentConversation) {
      setSelectedCustomer({
        id: currentConversation.id,
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
            {filteredConversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`conversation-item ${activeConversation === conversation.id ? 'active' : ''}`}
                onClick={() => handleConversationSelect(conversation.id)}
              >
                <div className="customer-avatar">{conversation.avatar}</div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-0">{conversation.name}</h6>
                    <small className="text-muted">{conversation.lastMessageTime}</small>
                  </div>
                  <p className="mb-0 text-muted small">{conversation.lastMessage}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="unread-badge">{conversation.unreadCount}</div>
                )}
              </div>
            ))}
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
              </div>
              
              {/* Chat Body */}
              <div className="chat-body" ref={chatMessagesRef}>
                {currentConversation.messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`message-bubble ${message.sender === 'seller' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{message.text}</div>
                    <div className="message-time">{message.time}</div>
                  </div>
                ))}
              </div>
              
              {/* Chat Footer */}
              <div className="chat-footer">
                <div className="message-input-group">
                  <button className="btn btn-outline-secondary" title="Attach File">
                    <i className="bi bi-paperclip"></i>
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
                  <button className="btn-seller" onClick={sendMessage}>
                    <i className="bi bi-send"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Select a conversation to start messaging</h5>
              <p className="text-muted">Choose a customer from the list to view your conversation history</p>
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
          justify-content: between;
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


