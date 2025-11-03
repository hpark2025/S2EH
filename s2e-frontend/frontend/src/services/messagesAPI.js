import { cookieAuth } from '../utils/cookieAuth.js'

/**
 * Messages API Service
 * Handles customer-seller messaging functionality
 * Uses direct fetch to backend (same pattern as userCartAPI)
 */
const getAuthToken = () => {
  // Try cookies first
  const auth = cookieAuth.getAuth()
  let token = auth.token
  
  // Fallback to localStorage
  if (!token) {
    const userType = localStorage.getItem('userType')
    token = localStorage.getItem(`${userType}Token`) || localStorage.getItem('token') || localStorage.getItem('adminToken')
  }
  
  return token
}

const fetchAPI = async (url, options = {}) => {
  const token = getAuthToken()
  
  // Use direct backend URL (same as userCartAPI)
  // Keep trailing slash as it helps avoid Apache redirect issues
  const fullUrl = `http://localhost:8080/S2EH/s2e-backend${url}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  console.log('📡 Fetching messages:', fullUrl)
  console.log('📡 Method:', options.method || 'GET')
  console.log('📡 Has token:', !!token)
  
  const response = await fetch(fullUrl, {
    method: options.method || 'GET',
    headers,
    body: options.body,
    // Don't use credentials to avoid CORS issues
    credentials: 'omit'
  })
  
  console.log('✅ Response status:', response.status)
  
  const text = await response.text()
  console.log('📄 Response text (first 200 chars):', text.substring(0, 200))
  
  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    throw new Error(text || 'Server returned invalid JSON')
  }
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }
  
  return data
}

export const messagesAPI = {
  /**
   * Get conversations list (for customer: list of sellers, for seller: list of customers)
   */
  getConversations: async () => {
    try {
      const data = await fetchAPI('/api/messages/')
      return data.data || data
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      throw error
    }
  },

  /**
   * Get messages for a specific conversation
   * @param {number} sellerId - Seller ID (for customer)
   * @param {number} customerId - Customer ID (for seller)
   */
  getMessages: async (sellerId = null, customerId = null) => {
    try {
      const params = []
      if (sellerId) params.push(`seller_id=${sellerId}`)
      if (customerId) params.push(`customer_id=${customerId}`)
      
      // No trailing slash when there are query params (avoids redirect)
      // Trailing slash only when no params
      const url = params.length > 0 
        ? `/api/messages?${params.join('&')}` 
        : '/api/messages/'
      const data = await fetchAPI(url)
      return data.data || data
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw error
    }
  },

  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @param {number} messageData.receiver_id - Receiver ID
   * @param {string} messageData.receiver_type - 'seller' or 'user'
   * @param {string} messageData.message - Message text
   * @param {string} messageData.subject - Optional subject
   * @param {number} messageData.parent_message_id - Optional parent message ID for replies
   * @param {File} messageData.image - Optional image file to attach
   */
  sendMessage: async (messageData) => {
    try {
      const token = getAuthToken()
      const fullUrl = `http://localhost:8080/S2EH/s2e-backend/api/messages/`
      
      let body, headers = {}
      
      if (messageData.image) {
        // Use FormData for image uploads
        const formData = new FormData()
        formData.append('receiver_id', messageData.receiver_id)
        formData.append('receiver_type', messageData.receiver_type)
        formData.append('message', messageData.message || '')
        if (messageData.subject) formData.append('subject', messageData.subject)
        if (messageData.parent_message_id) formData.append('parent_message_id', messageData.parent_message_id)
        formData.append('image', messageData.image)
        
        body = formData
        // Don't set Content-Type header when using FormData - browser will set it with boundary
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      } else {
        // Use JSON for text-only messages
        body = JSON.stringify(messageData)
        headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body,
        credentials: 'omit'
      })
      
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error(text || 'Server returned invalid JSON')
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }
      
      return data.data || data
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },

  /**
   * Mark messages as read
   * @param {number} sellerId - Seller ID (for customers)
   * @param {number} customerId - Customer ID (for sellers)
   */
  markAsRead: async (sellerId = null, customerId = null) => {
    try {
      const data = await fetchAPI('/api/messages/', {
        method: 'PUT',
        body: JSON.stringify({
          ...(sellerId && { seller_id: sellerId }),
          ...(customerId && { customer_id: customerId })
        })
      })
      return data.data || data
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
      throw error
    }
  }
}

