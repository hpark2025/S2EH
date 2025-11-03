import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { messagesAPI } from '../../../services/messagesAPI'
import { toast } from 'react-hot-toast'

export default function ProductChatModal({ show, onClose, sellerId, sellerName, productName, productId }) {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Load messages when modal opens
  useEffect(() => {
    if (show && sellerId) {
      loadMessages()
    }
  }, [show, sellerId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!sellerId) {
      console.warn('⚠️ No sellerId provided to loadMessages')
      return
    }
    
    // Ensure sellerId is a number
    const numericSellerId = parseInt(sellerId, 10)
    if (isNaN(numericSellerId)) {
      console.error('❌ Invalid sellerId:', sellerId)
      toast.error('Invalid seller information')
      return
    }
    
    console.log('📨 Loading messages for seller:', numericSellerId)
    
    try {
      setLoading(true)
      const response = await messagesAPI.getMessages(numericSellerId)
      
      console.log('✅ Messages loaded:', response)
      
      if (response.messages) {
        setMessages(response.messages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error)
      const errorMessage = error?.message || 'Failed to load messages'
      toast.error(errorMessage)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!sellerId) {
      toast.error('Seller information not available')
      return
    }

    try {
      setSending(true)
      
      // Create subject mentioning the product
      const subject = productName ? `Inquiry about ${productName}` : 'Product Inquiry'
      
      const messageData = {
        receiver_id: parseInt(sellerId),
        receiver_type: 'seller',
        message: message.trim(),
        subject: subject
      }

      await messagesAPI.sendMessage(messageData)
      
      // Clear input
      setMessage('')
      
      // Reload messages to show the new one
      await loadMessages()
      
      // Dispatch event to update header unread count
      window.dispatchEvent(new Event('messagesUpdated'))
      
      toast.success('Message sent successfully!')
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = error?.message || error?.data?.message || 'Failed to send message'
      toast.error(errorMessage)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!show) return null

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-chat-dots me-2"></i>
              Chat with {sellerName || 'Seller'}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body p-0" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            {/* Messages Area */}
            <div className="flex-grow-1 overflow-auto p-3" style={{ maxHeight: '400px', minHeight: '300px' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading messages...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-chat-left-dots fs-1 mb-3"></i>
                  <p>No messages yet. Start the conversation!</p>
                  {productName && (
                    <small className="text-muted">You're inquiring about: <strong>{productName}</strong></small>
                  )}
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {messages.map((msg) => {
                    const isFromSeller = msg.sender_type === 'seller'
                    return (
                      <div
                        key={msg.id}
                        className={`d-flex ${isFromSeller ? '' : 'justify-content-end'}`}
                      >
                        <div
                          className={`rounded p-3 ${
                            isFromSeller
                              ? 'bg-light align-self-start'
                              : 'bg-primary text-white align-self-end'
                          }`}
                          style={{ maxWidth: '75%' }}
                        >
                          <div className="d-flex flex-column">
                            {msg.subject && (
                              <small className={`mb-1 ${isFromSeller ? 'text-muted' : 'text-white-50'}`}>
                                <strong>{msg.subject}</strong>
                              </small>
                            )}
                            <div>{msg.message}</div>
                            <small className={`mt-1 ${isFromSeller ? 'text-muted' : 'text-white-50'}`}>
                              {formatTime(msg.created_at)}
                            </small>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-top p-3 bg-light">
              <form onSubmit={handleSendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !message.trim()}
                  >
                    {sending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-1"></i>Send
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button 
              type="button" 
              className="btn btn-outline-primary"
              onClick={() => {
                onClose()
                navigate('/auth/chat', { 
                  state: { 
                    sellerId: sellerId ? parseInt(sellerId, 10) : null,
                    autoSelect: true
                  } 
                })
              }}
            >
              <i className="bi bi-chat-left-text me-1"></i>
              Open Full Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ProductChatModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sellerId: PropTypes.number,
  sellerName: PropTypes.string,
  productName: PropTypes.string,
  productId: PropTypes.number
}

