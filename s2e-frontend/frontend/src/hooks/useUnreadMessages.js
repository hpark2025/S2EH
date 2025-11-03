import { useState, useEffect } from 'react'
import { messagesAPI } from '../services/messagesAPI'
import { useAppState } from '../context/AppContext.jsx'

export function useUnreadMessages() {
  const { state } = useAppState()
  const { isLoggedIn } = state
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    if (!isLoggedIn) {
      setUnreadCount(0)
      return
    }

    try {
      const response = await messagesAPI.getConversations()
      if (response.conversations) {
        // Sum up all unread counts from all conversations
        const totalUnread = response.conversations.reduce((sum, conv) => {
          return sum + (parseInt(conv.unread_count) || 0)
        }, 0)
        setUnreadCount(totalUnread)
      } else {
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to fetch unread message count:', error)
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount()
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      
      // Listen for custom events to update count
      const handleMessageUpdate = () => {
        fetchUnreadCount()
      }
      
      window.addEventListener('messagesUpdated', handleMessageUpdate)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('messagesUpdated', handleMessageUpdate)
      }
    } else {
      setUnreadCount(0)
    }
  }, [isLoggedIn])

  return { unreadCount, refreshUnreadCount: fetchUnreadCount }
}

