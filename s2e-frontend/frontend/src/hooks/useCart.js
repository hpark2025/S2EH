import { useState, useEffect } from 'react'

/**
 * Custom hook to manage cart state from localStorage
 * @returns {Object} Cart utilities
 */
export function useCart() {
  const [cartCount, setCartCount] = useState(0)
  const [cart, setCart] = useState([])

  // Load cart from localStorage
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart')
      console.log('🛒 Loading cart from localStorage:', savedCart)
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        console.log('🛒 Parsed cart:', parsedCart)
        
        const count = parsedCart.reduce((sum, item) => sum + item.quantity, 0)
        console.log('🛒 Cart count:', count)
        
        setCart(parsedCart)
        setCartCount(count)
        return parsedCart
      }
      
      console.log('🛒 No cart found in localStorage')
      setCart([])
      setCartCount(0)
      return []
    } catch (error) {
      console.error('❌ Failed to load cart:', error)
      setCart([])
      setCartCount(0)
      return []
    }
  }

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    try {
      console.log('➕ Adding to cart:', product.title, 'Qty:', quantity)
      const currentCart = loadCart()
      
      // Check if product already exists in cart
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id)
      
      let updatedCart
      if (existingItemIndex > -1) {
        // Update quantity if product exists
        updatedCart = [...currentCart]
        updatedCart[existingItemIndex].quantity += quantity
        console.log('✅ Updated existing item. New qty:', updatedCart[existingItemIndex].quantity)
      } else {
        // Add new product to cart
        updatedCart = [
          ...currentCart,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            images: product.images,
            sku: product.sku,
            seller_name: product.seller_name,
            quantity: quantity
          }
        ]
        console.log('✅ Added new item to cart')
      }
      
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      setCart(updatedCart)
      
      const count = updatedCart.reduce((sum, item) => sum + item.quantity, 0)
      console.log('🛒 New cart count:', count)
      setCartCount(count)
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('cartUpdated'))
      
      return true
    } catch (error) {
      console.error('❌ Failed to add to cart:', error)
      return false
    }
  }

  // Remove item from cart
  const removeFromCart = (productId) => {
    try {
      const currentCart = loadCart()
      const updatedCart = currentCart.filter(item => item.id !== productId)
      
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      setCart(updatedCart)
      
      const count = updatedCart.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
      
      window.dispatchEvent(new Event('cartUpdated'))
      return true
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      return false
    }
  }

  // Clear cart
  const clearCart = () => {
    try {
      localStorage.removeItem('cart')
      setCart([])
      setCartCount(0)
      window.dispatchEvent(new Event('cartUpdated'))
      return true
    } catch (error) {
      console.error('Failed to clear cart:', error)
      return false
    }
  }

  // Listen for cart updates from other components
  useEffect(() => {
    loadCart()
    
    const handleCartUpdate = () => {
      loadCart()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  return {
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    clearCart,
    loadCart
  }
}

