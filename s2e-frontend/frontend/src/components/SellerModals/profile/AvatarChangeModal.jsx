import { useState, useRef } from 'react'
import PropTypes from 'prop-types'

const AvatarChangeModal = ({ show, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    scale: 1
  })
  const fileInputRef = useRef(null)

  if (!show) return null

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      handleFileSelect({ target: { files: [file] } })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      console.log('Uploading file:', selectedFile)
      console.log('Crop settings:', cropSettings)
      
      setIsUploaded(true)
      
      setTimeout(() => {
        setIsUploaded(false)
        resetForm()
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your current avatar?')) {
      return
    }
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Removing avatar')
      
      setIsUploaded(true)
      setTimeout(() => {
        setIsUploaded(false)
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Error removing avatar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setCropSettings({ x: 0, y: 0, width: 100, height: 100, scale: 1 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (isUploaded) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Avatar Updated Successfully!</h5>
              <p className="text-muted">Your profile picture has been updated.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-circle me-2"></i>
              Change Avatar
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info mb-3" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Upload a new profile picture or remove your current avatar. Use square images for best results.
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 className="mb-3">Current Avatar</h6>
                <div className="text-center mb-3">
                  <img 
                    src="/images/unknown.jpg" 
                    alt="Current Avatar" 
                    className="rounded-circle mb-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                  <div>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleRemoveAvatar}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Remove Avatar
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="mb-3">Upload New Avatar</h6>
                
                {!selectedFile ? (
                  <div 
                    className="upload-area border-2 border-dashed rounded p-4 text-center"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{ 
                      borderColor: '#dee2e6',
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mb-2">Drop your image here or click to browse</p>
                    <p className="text-muted small">Supports: JPG, PNG, GIF (Max 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="preview-container mb-3">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">File: {selectedFile.name}</small>
                      <small className="text-muted d-block">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={resetForm}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Choose Different Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {selectedFile && (
              <div className="mt-4">
                <h6 className="mb-3">Crop Settings</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Scale</label>
                      <input
                        type="range"
                        className="form-range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={cropSettings.scale}
                        onChange={(e) => setCropSettings(prev => ({
                          ...prev,
                          scale: parseFloat(e.target.value)
                        }))}
                      />
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">50%</small>
                        <small className="text-muted">{Math.round(cropSettings.scale * 100)}%</small>
                        <small className="text-muted">200%</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Crop to Circle</label>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="cropCircle" defaultChecked />
                        <label className="form-check-label" htmlFor="cropCircle">
                          Apply circular crop
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="alert alert-info mt-3">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Tips:</strong>
              <ul className="mb-0 mt-2">
                <li>Use a square image (1:1 aspect ratio) for best results</li>
                <li>Minimum recommended size: 200x200 pixels</li>
                <li>Your avatar will be displayed as a circle</li>
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={isLoading}
              style={{ minWidth: '100px' }}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              style={{ minWidth: '150px' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-2"></i>
                  Upload Avatar
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
  onClose: PropTypes.func.isRequired
}

export default AvatarChangeModal