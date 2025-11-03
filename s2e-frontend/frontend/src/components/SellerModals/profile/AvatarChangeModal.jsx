import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { sellerAPI } from '../../../services/sellerAPI'

export default function AvatarChangeModal({ show, onClose, onUploadSuccess, currentAvatar }) {
  const [avatarPreview, setAvatarPreview] = useState(currentAvatar || '/images/unknown.jpg')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  // Update preview when currentAvatar changes
  useEffect(() => {
    if (currentAvatar) {
      setAvatarPreview(`http://localhost:8080${currentAvatar}`)
    } else {
      setAvatarPreview('/images/unknown.jpg')
    }
  }, [currentAvatar])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }
      
      setSelectedFile(file)
      setError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      console.log('📤 Uploading avatar to database...')
      
      // Upload avatar to backend
      const response = await sellerAPI.uploadAvatar(selectedFile)
      
      console.log('✅ Avatar uploaded:', response)
      
      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(response.data?.avatar || response.data?.avatar_url)
      }
      
      // Close modal
      handleClose()
      
    } catch (error) {
      console.error('❌ Failed to upload avatar:', error)
      setError(error.response?.data?.message || error.message || 'Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    // Reset to current avatar
    if (currentAvatar) {
      setAvatarPreview(`http://localhost:8080${currentAvatar}`)
    } else {
      setAvatarPreview('/images/unknown.jpg')
    }
    setSelectedFile(null)
    setError(null)
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-circle me-2"></i>Update Profile Picture
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
              disabled={isUploading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="text-center">
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              <div className="mb-3">
                <img 
                  src={avatarPreview} 
                  alt="Avatar Preview" 
                  className="preview-avatar rounded-circle" 
                  width="150" 
                  height="150"
                  style={{ objectFit: 'cover', border: '3px solid #dee2e6' }}
                  onError={(e) => {
                    e.target.src = '/images/unknown.jpg'
                  }}
                />
              </div>
              <div className="mb-3">
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  id="avatarUpload"
                  disabled={isUploading}
                />
                <label htmlFor="avatarUpload" className="form-label mt-2">
                  Choose a new profile picture
                </label>
              </div>
              <div className="alert alert-info" role="alert">
                <small>
                  <i className="bi bi-info-circle me-1"></i>
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                </small>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isUploading}
            >
              <i className="bi bi-x-lg me-1"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-1"></i>Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

AvatarChangeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUploadSuccess: PropTypes.func,
  currentAvatar: PropTypes.string
}

AvatarChangeModal.defaultProps = {
  currentAvatar: null
}
