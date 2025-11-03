import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-hot-toast'

export default function OrderReviewModal({ show, onClose, onSubmit, order }) {
  const [reviews, setReviews] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize reviews state for each product in the order
  useEffect(() => {
    if (order && order.items) {
      const initialReviews = {}
      order.items.forEach(item => {
        initialReviews[item.product_id] = {
          rating: 0,
          title: '',
          review: ''
        }
      })
      setReviews(initialReviews)
    }
  }, [order])

  const handleInputChange = (productId, field, value) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
    
    // Clear errors when user starts typing
    if (errors[productId] && errors[productId][field]) {
      setErrors(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: ''
        }
      }))
    }
  }

  const handleRatingChange = (productId, rating) => {
    handleInputChange(productId, 'rating', rating)
  }

  const validateForm = () => {
    const newErrors = {}
    let hasErrors = false

    if (!order || !order.items) {
      return false
    }

    order.items.forEach(item => {
      const review = reviews[item.product_id] || {}
      const itemErrors = {}

      if (!review.rating || review.rating === 0) {
        itemErrors.rating = 'Please select a rating'
        hasErrors = true
      }
      if (!review.title || !review.title.trim()) {
        itemErrors.title = 'Review title is required'
        hasErrors = true
      }
      if (!review.review || !review.review.trim()) {
        itemErrors.review = 'Review content is required'
        hasErrors = true
      } else if (review.review.trim().length < 10) {
        itemErrors.review = 'Review must be at least 10 characters long'
        hasErrors = true
      }

      if (Object.keys(itemErrors).length > 0) {
        newErrors[item.product_id] = itemErrors
      }
    })

    setErrors(newErrors)
    return !hasErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please complete all reviews before submitting')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Format reviews for submission
      console.log('📦 Order data:', order)
      console.log('📦 Order items:', order.items)
      console.log('📦 Reviews state:', reviews)
      
      const reviewData = order.items.map(item => {
        const productId = item.product_id
        const orderId = order.orderId // This is the database ID, not the order_number
        
        console.log('📦 Processing item:', { productId, orderId, item })
        
        if (!productId) {
          console.error('Missing product_id for item:', item)
          throw new Error(`Product ID is missing for item: ${item.name || 'Unknown'}`)
        }
        
        if (!orderId) {
          console.error('Missing orderId for order:', order)
          throw new Error('Order ID is missing')
        }
        
        const review = reviews[productId] || {}
        
        if (!review.rating || review.rating === 0) {
          console.warn(`No rating provided for product ${productId}`)
        }
        
        if (!review.title || !review.title.trim()) {
          console.warn(`No title provided for product ${productId}`)
        }
        
        if (!review.review || !review.review.trim()) {
          console.warn(`No review content provided for product ${productId}`)
        }
        
        return {
          product_id: parseInt(productId, 10),
          order_id: parseInt(orderId, 10),
          rating: parseInt(review.rating || 0, 10),
          title: (review.title || '').trim(),
          review: (review.review || '').trim()
        }
      })

      console.log('📝 Submitting reviews:', reviewData)
      
      // Validate all reviews have required fields before submitting
      const invalidReviews = reviewData.filter(r => !r.product_id || !r.order_id || r.rating === 0 || !r.title || !r.review)
      if (invalidReviews.length > 0) {
        console.error('Invalid reviews:', invalidReviews)
        throw new Error('Please complete all required fields for each product review')
      }
      
      await onSubmit(reviewData)
      handleClose()
    } catch (error) {
      console.error('Error submitting reviews:', error)
      toast.error(error.message || 'Failed to submit reviews. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset form
    if (order && order.items) {
      const resetReviews = {}
      order.items.forEach(item => {
        resetReviews[item.product_id] = {
          rating: 0,
          title: '',
          review: ''
        }
      })
      setReviews(resetReviews)
    }
    setErrors({})
    onClose()
  }

  const renderStars = (productId, currentRating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`btn btn-link p-0 me-1 ${
          star <= currentRating ? 'text-warning' : 'text-muted'
        }`}
        onClick={() => handleRatingChange(productId, star)}
        style={{ fontSize: '1.5rem', textDecoration: 'none' }}
      >
        <i className={star <= currentRating ? 'bi bi-star-fill' : 'bi bi-star'}></i>
      </button>
    ))
  }

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Select a rating'
    }
  }

  if (!show || !order) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-star me-2"></i>Rate & Review Order
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info mb-4">
              <div className="d-flex">
                <i className="bi bi-info-circle me-2 mt-1"></i>
                <div>
                  <strong>Order #{order.order_number || order.id}</strong>
                  <p className="mb-0">Please rate and review each product from this order. All reviews are required.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {order.items && order.items.map((item, index) => {
                const review = reviews[item.product_id] || { rating: 0, title: '', review: '' }
                const itemErrors = errors[item.product_id] || {}

                return (
                  <div key={item.product_id || index} className="border rounded p-4 mb-4">
                    <div className="d-flex mb-3">
                      {item.product_image && (
                        <img 
                          src={`http://localhost:8080/S2EH/s2e-backend${item.product_image}`}
                          alt={item.product_title}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }}
                        />
                      )}
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.product_title}</h6>
                        <p className="text-muted mb-0 small">Qty: {item.quantity}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rating *</label>
                      <div className="d-flex align-items-center">
                        <div className="rating-input me-3">
                          {renderStars(item.product_id, review.rating)}
                        </div>
                        <span className="text-muted">
                          {getRatingText(review.rating)}
                        </span>
                      </div>
                      {itemErrors.rating && (
                        <div className="text-danger small mt-1">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {itemErrors.rating}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Review Title *</label>
                      <input 
                        type="text" 
                        className={`form-control ${itemErrors.title ? 'is-invalid' : ''}`}
                        value={review.title}
                        onChange={(e) => handleInputChange(item.product_id, 'title', e.target.value)}
                        placeholder="Summarize your experience with this product"
                        maxLength="100"
                      />
                      <div className="form-text">
                        {review.title.length}/100 characters
                      </div>
                      {itemErrors.title && <div className="invalid-feedback">{itemErrors.title}</div>}
                    </div>
                    
                    <div className="mb-0">
                      <label className="form-label">Your Review *</label>
                      <textarea 
                        className={`form-control ${itemErrors.review ? 'is-invalid' : ''}`}
                        value={review.review}
                        onChange={(e) => handleInputChange(item.product_id, 'review', e.target.value)}
                        rows="4"
                        placeholder="Share your thoughts about this product. What did you like or dislike? How was the quality?"
                        maxLength="1000"
                      />
                      <div className="form-text">
                        {review.review.length}/1000 characters (minimum 10 characters)
                      </div>
                      {itemErrors.review && <div className="invalid-feedback">{itemErrors.review}</div>}
                    </div>
                  </div>
                )
              })}

              <div className="alert alert-warning" role="alert">
                <div className="d-flex">
                  <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
                  <div>
                    <strong>Note:</strong> Please ensure all products are rated and reviewed before submitting. 
                    Once submitted, reviews cannot be edited.
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-lg me-1"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-1"></i>Submit Reviews
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

OrderReviewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  order: PropTypes.object
}

