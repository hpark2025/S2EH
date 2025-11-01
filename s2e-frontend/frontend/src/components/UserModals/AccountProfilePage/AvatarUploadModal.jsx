import { useState } from 'react'
import PropTypes from 'prop-types'

export default function AvatarUploadModal({ show, onClose, onUpload, currentAvatar }) {
  const [avatarPreview, setAvatarPreview] = useState(currentAvatar)
  const [selectedFile, setSelectedFile] = useState(null)

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
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, avatarPreview)
    } else {
      onUpload(null, avatarPreview)
    }
  }

  const handleClose = () => {
    setAvatarPreview(currentAvatar)
    setSelectedFile(null)
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
            ></button>
          </div>
          <div className="modal-body">
            <div className="text-center">
              <div className="mb-3">
                <img 
                  src={avatarPreview} 
                  alt="Avatar Preview" 
                  className="preview-avatar rounded-circle" 
                  width="150" 
                  height="150"
                  style={{ objectFit: 'cover', border: '3px solid #dee2e6' }}
                />
              </div>
              <div className="mb-3">
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  id="avatarUpload"
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
            >
              <i className="bi bi-x-lg me-1"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleUpload}
            >
              <i className="bi bi-upload me-1"></i>Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

AvatarUploadModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  currentAvatar: PropTypes.string
}

AvatarUploadModal.defaultProps = {
  currentAvatar: '/images/unknown.jpg'
}