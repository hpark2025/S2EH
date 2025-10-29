import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'

export default function UserChatPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { isLoggedIn } = state
  
  const [activeTab, setActiveTab] = useState('messages')
  const [activeChat, setActiveChat] = useState('seller1')
  const [message, setMessage] = useState('')

  // Sample chat data
  const chatData = {
    seller1: {
      id: 'seller1',
      name: 'Maria Santos',
      avatar: '/images/unknown.jpg',
      status: 'online',
      statusColor: 'success',
      lastMessage: 'Thank you for your interest in my handwoven baskets!',
      lastTime: '2:30 PM',
      unreadCount: 2,
      messages: [
        {
          id: 1,
          sender: 'seller',
          avatar: '/images/unknown.jpg',
          text: 'Hello! Thank you for your interest in my handwoven baskets. I have several sizes and designs available.',
          time: '2:25 PM',
          type: 'text'
        },
        {
          id: 2,
          sender: 'user',
          text: "Hi Maria! I'm interested in the medium-sized basket. What's the price and delivery time?",
          time: '2:26 PM',
          type: 'text'
        },
        {
          id: 3,
          sender: 'seller',
          avatar: '/images/unknown.jpg',
          text: 'The medium basket is ₱350. It\'s handwoven with high-quality abaca fiber. I can deliver within 3-5 days via LBC Express.',
          time: '2:28 PM',
          type: 'text'
        },
        {
          id: 4,
          sender: 'seller',
          avatar: '/images/unknown.jpg',
          time: '2:30 PM',
          type: 'product',
          product: {
            id: 2, // Product ID for navigation
            name: 'Handwoven Basket',
            price: '₱350.00',
            seller: 'Maria Santos',
            image: '/images/unknown.jpg'
          }
        }
      ]
    },
    seller2: {
      id: 'seller2',
      name: 'Juan Dela Cruz',
      avatar: '/images/unknown.jpg',
      status: 'away',
      statusColor: 'warning',
      lastMessage: 'The organic rice is freshly harvested. When would you like delivery?',
      lastTime: 'Yesterday',
      unreadCount: 1,
      messages: [
        {
          id: 1,
          sender: 'seller',
          avatar: '/images/unknown.jpg',
          text: 'The organic rice is freshly harvested. When would you like delivery?',
          time: 'Yesterday',
          type: 'text'
        }
      ]
    },
    seller3: {
      id: 'seller3',
      name: 'Pedro Reyes',
      avatar: '/images/unknown.jpg',
      status: 'offline',
      statusColor: 'secondary',
      lastMessage: 'Hi! I have fresh coconut jam available.',
      lastTime: 'Monday',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: 'seller',
          avatar: '/images/unknown.jpg',
          text: 'Hi! I have fresh coconut jam available.',
          time: 'Monday',
          type: 'text'
        }
      ]
    },
    support: {
      id: 'support',
      name: 'S2EH Support',
      avatar: null,
      status: 'online',
      statusColor: 'success',
      lastMessage: 'How can we help you today?',
      lastTime: 'Online',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          sender: 'support',
          text: 'How can we help you today?',
          time: 'Online',
          type: 'text'
        }
      ]
    }
  }

  const currentChat = chatData[activeChat]
  const chatList = activeTab === 'messages' 
    ? [chatData.seller1, chatData.seller2, chatData.seller3]
    : [chatData.support]

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message logic here
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const viewProduct = (productId) => {
    // Navigate to product details with conditional routing based on authentication
    const path = isLoggedIn ? `/auth/products/${productId}` : `/user/products/${productId}`
    navigate(path)
  }

  return (
    <div className="container-fluid" style={{ marginTop: '90px', height: 'calc(100vh - 90px)' }}>
      <div className="row h-100">
        {/* Chat Sidebar */}
        <div className="col-md-4 col-lg-3 border-end bg-light h-100 p-0">
          <div className="chat-sidebar h-100 d-flex flex-column">
            {/* Chat Header */}
            <div className="chat-sidebar-header p-3 border-bottom bg-white">
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>Messages
              </h5>
              <small className="text-muted">Connect with sellers and support</small>
            </div>

            {/* Chat Tabs */}
            <div className="chat-tabs border-bottom bg-white">
              <nav className="nav nav-pills nav-fill p-2">
                <button 
                  className={`nav-link ${activeTab === 'messages' ? 'active' : 'text-muted'}`}
                  onClick={() => setActiveTab('messages')}
                  type="button"
                  style={{ 
                    backgroundColor: activeTab === 'messages' ? '#0d6efd' : 'transparent',
                    color: activeTab === 'messages' ? 'white' : '#6c757d',
                    border: 'none'
                  }}
                >
                  <i className="bi bi-chat-left-text me-1"></i>Messages
                </button>
                <button 
                  className={`nav-link ${activeTab === 'support' ? 'active' : 'text-muted'}`}
                  onClick={() => {
                    setActiveTab('support')
                    setActiveChat('support')
                  }}
                  type="button"
                  style={{ 
                    backgroundColor: activeTab === 'support' ? '#0d6efd' : 'transparent',
                    color: activeTab === 'support' ? 'white' : '#6c757d',
                    border: 'none'
                  }}
                >
                  <i className="bi bi-headset me-1"></i>Support
                </button>
              </nav>
            </div>

            {/* Chat List */}
            <div className="tab-content flex-grow-1 overflow-auto">
              <div className="chat-list">
                {chatList.map((chat) => (
                  <div 
                    key={chat.id}
                    className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
                    onClick={() => setActiveChat(chat.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center p-3 border-bottom chat-item-content">
                      <div className="chat-avatar me-3 position-relative">
                        {chat.avatar ? (
                          <img 
                            src={chat.avatar} 
                            alt={chat.name} 
                            className="rounded-circle" 
                            width="50" 
                            height="50" 
                          />
                        ) : (
                          <div 
                            className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                            style={{ width: '50px', height: '50px' }}
                          >
                            <i className="bi bi-headset text-white"></i>
                          </div>
                        )}
                        <span className={`badge bg-${chat.statusColor} position-absolute bottom-0 end-0 rounded-circle p-2`}></span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1">{chat.name}</h6>
                          <small className="text-muted">{chat.lastTime}</small>
                        </div>
                        <p className="mb-1 text-truncate">{chat.lastMessage}</p>
                        {chat.unreadCount > 0 && (
                          <span className="badge bg-primary rounded-pill">{chat.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-md-8 col-lg-9 h-100 p-0">
          <div className="chat-window h-100 d-flex flex-column">
            {/* Chat Header */}
            <div className="chat-header p-3 border-bottom bg-white">
              <div className="d-flex align-items-center">
                {currentChat.avatar ? (
                  <img 
                    src={currentChat.avatar} 
                    alt={currentChat.name} 
                    className="rounded-circle me-3" 
                    width="40" 
                    height="40" 
                  />
                ) : (
                  <div 
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="bi bi-headset text-white"></i>
                  </div>
                )}
                <div>
                  <h6 className="mb-0">{currentChat.name}</h6>
                  <small className={`text-${currentChat.statusColor}`}>
                    <i className="bi bi-circle-fill me-1"></i>
                    {currentChat.status === 'online' ? 'Online' : 
                     currentChat.status === 'away' ? 'Away' : 'Offline'}
                  </small>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages flex-grow-1 overflow-auto p-3" id="chatMessages">
              {currentChat.messages.map((msg) => (
                <div key={msg.id} className="message mb-3">
                  {msg.sender === 'user' ? (
                    // User message (right side)
                    <div className="d-flex justify-content-end">
                      <div className="message-content">
                        <div className="message-bubble bg-primary text-white p-3 rounded">
                          <p className="mb-1">{msg.text}</p>
                          <small className="text-light">{msg.time}</small>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Seller/Support message (left side)
                    <div className="d-flex">
                      {msg.avatar ? (
                        <img 
                          src={msg.avatar} 
                          alt={currentChat.name} 
                          className="rounded-circle me-2" 
                          width="32" 
                          height="32" 
                        />
                      ) : (
                        <div 
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                          style={{ width: '32px', height: '32px' }}
                        >
                          <i className="bi bi-headset text-white fs-6"></i>
                        </div>
                      )}
                      <div className="message-content">
                        <div className="message-bubble bg-light p-3 rounded">
                          {msg.type === 'product' ? (
                            <>
                              <div className="product-share border rounded p-3 mb-2">
                                <div className="d-flex">
                                  <img 
                                    src={msg.product.image} 
                                    alt={msg.product.name} 
                                    className="rounded me-3" 
                                    width="60" 
                                    height="60" 
                                  />
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1">{msg.product.name}</h6>
                                    <p className="text-success fw-bold mb-1">{msg.product.price}</p>
                                    <small className="text-muted">By: {msg.product.seller}</small>
                                  </div>
                                  <button 
                                    className="btn btn-sm btn-primary ms-2"
                                    onClick={() => viewProduct(msg.product.id)}
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                              <small className="text-muted">{msg.time}</small>
                            </>
                          ) : (
                            <>
                              <p className="mb-1">{msg.text}</p>
                              <small className="text-muted">{msg.time}</small>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="chat-input p-3 border-top bg-white">
              <div className="input-group">
                <button className="btn btn-outline-secondary" type="button">
                  <i className="bi bi-paperclip"></i>
                </button>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type your message..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="btn btn-outline-secondary" type="button">
                  <i className="bi bi-emoji-smile"></i>
                </button>
                <button 
                  className="btn btn-primary" 
                  type="button" 
                  onClick={handleSendMessage}
                >
                  <i className="bi bi-send"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
