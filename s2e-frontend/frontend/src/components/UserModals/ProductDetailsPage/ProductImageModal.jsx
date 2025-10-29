import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export default function ProductImageModal({ show, onClose, images, activeIndex }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (activeIndex !== undefined) {
      setCurrentIndex(activeIndex)
    }
  }, [activeIndex])

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToImage = (index) => {
    setCurrentIndex(index)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [show])

  if (!show || !images || images.length === 0) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div className="modal-content bg-transparent border-0">
          <div className="modal-header border-0 bg-transparent">
            <h5 className="modal-title text-white">
              <i className="bi bi-images me-2"></i>Product Images
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-center p-0">
            <div className="position-relative">
              <img 
                src={images[currentIndex]} 
                alt={`Product image ${currentIndex + 1}`}
                className="img-fluid rounded"
                style={{ maxHeight: '70vh', maxWidth: '100%' }}
              />
              
              {images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button 
                    className="btn btn-dark btn-lg position-absolute top-50 start-0 translate-middle-y ms-3"
                    onClick={prevImage}
                    style={{ opacity: 0.8 }}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  
                  {/* Next Button */}
                  <button 
                    className="btn btn-dark btn-lg position-absolute top-50 end-0 translate-middle-y me-3"
                    onClick={nextImage}
                    style={{ opacity: 0.8 }}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  
                  {/* Image Counter */}
                  <div 
                    className="position-absolute bottom-0 end-0 bg-dark text-white px-3 py-1 rounded-top-start"
                    style={{ opacity: 0.8 }}
                  >
                    {currentIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="mt-3 d-flex justify-content-center flex-wrap">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`btn p-1 me-2 mb-2 ${
                      index === currentIndex ? 'border border-primary' : 'border border-secondary'
                    }`}
                    onClick={() => goToImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover',
                        opacity: index === currentIndex ? 1 : 0.6
                      }}
                      className="rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer border-0 bg-transparent justify-content-center">
            <small className="text-white-50">
              <i className="bi bi-info-circle me-1"></i>
              Use arrow keys or click thumbnails to navigate
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

ProductImageModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  activeIndex: PropTypes.number
}

ProductImageModal.defaultProps = {
  images: [],
  activeIndex: 0
}