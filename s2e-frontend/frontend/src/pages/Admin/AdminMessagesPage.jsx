import { useState, useMemo } from 'react'

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
    message: ''
  })

  // Filter state
  const [messageTypeFilter, setMessageTypeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')

  const mockMessages = []

  const filteredMessages = useMemo(() => {
    let filtered = mockMessages.filter(message => {
      const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.fromTo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.preview.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTab = activeTab === 'all' || message.type === activeTab
      
      return matchesSearch && matchesTab
    })
    
    return filtered
  }, [searchTerm, activeTab])

  const statusCounts = useMemo(() => ({
    all: mockMessages.length,
    received: mockMessages.filter(m => m.type === 'received').length,
    sent: mockMessages.filter(m => m.type === 'sent').length,
    archived: mockMessages.filter(m => m.type === 'archived').length
  }), [])

  const handleMessageAction = (message, action) => {
    setSelectedMessage(message)
    switch(action) {
      case 'reply':
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

  const closeAllModals = () => {
    setShowComposeModal(false)
    setShowReplyModal(false)
    setShowArchiveModal(false)
    setShowUnarchiveModal(false)
    setSelectedMessage(null)
    setComposeForm({ recipient: '', subject: '', message: '' })
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

      {/* Message Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Send Message */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="bi bi-send"></i>
              Send Message
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => { e.preventDefault(); setShowComposeModal(true); }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>To:</label>
                <select 
                  className="form-control"
                  value={composeForm.recipient}
                  onChange={(e) => setComposeForm({...composeForm, recipient: e.target.value})}
                >
                  <option value="">Select recipient...</option>
                  <option value="all-users">All Users</option>
                  <option value="all-producers">All Producers</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Subject:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter message subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Message:</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder="Type your message here..."
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({...composeForm, message: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="btn-admin btn-admin-primary" style={{ width: '100%' }}>
                <i className="bi bi-send"></i>
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Message Filters */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="bi bi-funnel"></i>
              Message Filters
            </h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Message Type:</label>
              <select 
                className="form-control"
                value={messageTypeFilter}
                onChange={(e) => setMessageTypeFilter(e.target.value)}
              >
                <option value="all">All Messages</option>
                <option value="received">Received Messages</option>
                <option value="sent">Sent Messages</option>
                <option value="archived">Archived Messages</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Date Range:</label>
              <select 
                className="form-control"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="3months">Last 3 months</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Search:</label>
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-admin btn-admin-secondary" style={{ width: '100%' }}>
              <i className="bi bi-search"></i>
              Apply Filters
            </button>
          </div>
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
                placeholder="Search messages..."
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

          {filteredMessages.length === 0 && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: 'var(--secondary-color)' 
            }}>
              <i className="bi bi-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <div>No messages found matching your search criteria.</div>
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
              <form>
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
                    <input type="text" className="form-control" placeholder="Enter username or email" />
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

                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button className="btn-admin btn-admin-primary" onClick={closeAllModals}>
                <i className="bi bi-send"></i>
                Send Message
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

              <form>
                <div className="form-group">
                  <label>Subject *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    defaultValue={`Re: ${selectedMessage.subject}`}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reply Message *</label>
                  <textarea 
                    className="form-control" 
                    rows="6" 
                    placeholder="Type your reply here..."
                    required
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={closeAllModals}>
                Cancel
              </button>
              <button className="btn-admin btn-admin-primary" onClick={closeAllModals}>
                <i className="bi bi-reply"></i>
                Send Reply
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


