import { useState } from 'react'
import PropTypes from 'prop-types'

export default function ProductReviewModal({ show, onClose, onSubmit, productName }) {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
    
    if (errors.rating) {
      setErrors(prev => ({
        ...prev,
        rating: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (formData.rating === 0) newErrors.rating = 'Please select a rating'
    if (!formData.title.trim()) newErrors.title = 'Review title is required'
    if (!formData.review.trim()) newErrors.review = 'Review content is required'
    if (formData.review.trim().length < 10) newErrors.review = 'Review must be at least 10 characters long'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      handleClose()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      rating: 0,
      title: '',
      review: ''
    })
    setErrors({})
    onClose()
  }

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`btn btn-link p-0 me-1 ${
          star <= formData.rating ? 'text-warning' : 'text-muted'
        }`}
        onClick={() => handleRatingChange(star)}
        style={{ fontSize: '1.5rem', textDecoration: 'none' }}
      >
        <i className={star <= formData.rating ? 'bi bi-star-fill' : 'bi bi-star'}></i>
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

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-star me-2"></i>Write a Review
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {productName && (
              <div className="alert alert-light" role="alert">
                <strong>Product:</strong> {productName}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Rating *</label>
                <div className="d-flex align-items-center">
                  <div className="rating-input me-3">
                    {renderStars()}
                  </div>
                  <span className="text-muted">
                    {getRatingText(formData.rating)}
                  </span>
                </div>
                {errors.rating && (
                  <div className="text-danger small mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.rating}
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <label className="form-label">Review Title *</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Summarize your experience"
                  maxLength="100"
                />
                <div className="form-text">
                  {formData.title.length}/100 characters
                </div>
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              
              <div className="mb-3">
                <label className="form-label">Your Review *</label>
                <textarea 
                  className={`form-control ${errors.review ? 'is-invalid' : ''}`}
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Share your thoughts about this product. What did you like or dislike? How was the quality? Would you recommend it to others?"
                  maxLength="1000"
                />
                <div className="form-text">
                  {formData.review.length}/1000 characters (minimum 10 characters)
                </div>
                {errors.review && <div className="invalid-feedback">{errors.review}</div>}
              </div>
              
              <div className="alert alert-info" role="alert">
                <div className="d-flex">
                  <i className="bi bi-info-circle me-2 mt-1"></i>
                  <div>
                    <strong>Review Guidelines:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Be honest and helpful to other customers</li>
                      <li>Focus on the product's features and quality</li>
                      <li>Avoid inappropriate language or personal information</li>
                      <li>Reviews are public and cannot be deleted once submitted</li>
                    </ul>
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
                  <i className="bi bi-check-lg me-1"></i>Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ProductReviewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  productName: PropTypes.string
}