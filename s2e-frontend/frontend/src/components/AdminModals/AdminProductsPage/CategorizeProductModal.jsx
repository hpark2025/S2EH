import { useState, useEffect } from 'react'

const CategorizeProductModal = ({ show, onClose, onCategorize, product }) => {
  const [primaryCategory, setPrimaryCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [tags, setTags] = useState({
    organic: false,
    handmade: false,
    ecoFriendly: false,
    traditional: false,
    premium: false,
    seasonal: false,
    limited: false,
    giftSet: false,
    bulkOrder: false
  })
  const [customTags, setCustomTags] = useState('')
  const [featuredCategory, setFeaturedCategory] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')

  const subCategories = {
    agricultural: ['Rice & Grains', 'Vegetables', 'Fruits', 'Herbs & Spices', 'Livestock Products'],
    handicrafts: ['Wood Crafts', 'Bamboo Products', 'Pottery', 'Woven Items', 'Metal Crafts'],
    'food-products': ['Processed Foods', 'Beverages', 'Snacks', 'Preserves', 'Condiments'],
    textiles: ['Traditional Clothing', 'Fabrics', 'Bags', 'Hats', 'Shoes'],
    furniture: ['Chairs', 'Tables', 'Storage', 'Decorative Items', 'Garden Furniture'],
    accessories: ['Jewelry', 'Bags', 'Belts', 'Hair Accessories', 'Traditional Items']
  }

  useEffect(() => {
    if (!show) {
      setPrimaryCategory('')
      setSubCategory('')
      setTags({
        organic: false,
        handmade: false,
        ecoFriendly: false,
        traditional: false,
        premium: false,
        seasonal: false,
        limited: false,
        giftSet: false,
        bulkOrder: false
      })
      setCustomTags('')
      setFeaturedCategory('')
      setSearchKeywords('')
    } else if (product) {
      // Pre-populate with existing data if available
      setPrimaryCategory(product.primaryCategory || '')
      setSubCategory(product.subCategory || '')
      setFeaturedCategory(product.featuredCategory || '')
      setSearchKeywords(product.searchKeywords || '')
    }
  }, [show, product])

  const handleTagChange = (tagName, checked) => {
    setTags(prev => ({
      ...prev,
      [tagName]: checked
    }))
  }

  const handleSubmit = () => {
    if (!primaryCategory) {
      alert('Please select a primary category')
      return
    }

    const selectedTags = Object.keys(tags).filter(key => tags[key])
    const allTags = [...selectedTags]
    
    if (customTags.trim()) {
      const customTagsArray = customTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      allTags.push(...customTagsArray)
    }

    const categorizeData = {
      primaryCategory,
      subCategory,
      tags: allTags,
      featuredCategory,
      searchKeywords: searchKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword),
      categorizedAt: new Date().toISOString(),
      categorizedBy: 'admin' // This would be the current admin user
    }

    onCategorize(product.id, categorizeData)
    onClose()
  }

  if (!show || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className="bi bi-tags text-info me-2"></i>
            Categorize Product
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="product-info bg-light p-3 rounded mb-3">
            <div className="d-flex align-items-center">
              <img 
                src={product.image} 
                alt="Product" 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  objectFit: 'cover', 
                  borderRadius: '4px' 
                }} 
                className="me-3"
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                <small style={{ color: 'var(--secondary-color)' }}>
                  {product.category} • ₱{product.price} • {product.producer}
                </small>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Primary Category *</label>
                <select 
                  className="form-control" 
                  value={primaryCategory}
                  onChange={(e) => {
                    setPrimaryCategory(e.target.value)
                    setSubCategory('') // Reset subcategory when primary changes
                  }}
                  required
                >
                  <option value="">Select Primary Category</option>
                  <option value="agricultural">Agricultural Products</option>
                  <option value="handicrafts">Handicrafts & Crafts</option>
                  <option value="food-products">Food Products</option>
                  <option value="textiles">Textiles & Clothing</option>
                  <option value="furniture">Furniture & Home Decor</option>
                  <option value="accessories">Accessories & Jewelry</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Sub Category</label>
                <select 
                  className="form-control"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={!primaryCategory}
                >
                  <option value="">Select Sub Category</option>
                  {primaryCategory && subCategories[primaryCategory]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label>Additional Tags</label>
            <div className="row">
              <div className="col-md-4">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagOrganic"
                    checked={tags.organic}
                    onChange={(e) => handleTagChange('organic', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagOrganic">Organic</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagHandmade"
                    checked={tags.handmade}
                    onChange={(e) => handleTagChange('handmade', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagHandmade">Handmade</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagEcoFriendly"
                    checked={tags.ecoFriendly}
                    onChange={(e) => handleTagChange('ecoFriendly', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagEcoFriendly">Eco-Friendly</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagTraditional"
                    checked={tags.traditional}
                    onChange={(e) => handleTagChange('traditional', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagTraditional">Traditional</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagPremium"
                    checked={tags.premium}
                    onChange={(e) => handleTagChange('premium', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagPremium">Premium Quality</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagSeasonal"
                    checked={tags.seasonal}
                    onChange={(e) => handleTagChange('seasonal', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagSeasonal">Seasonal</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagLimited"
                    checked={tags.limited}
                    onChange={(e) => handleTagChange('limited', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagLimited">Limited Edition</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagGiftSet"
                    checked={tags.giftSet}
                    onChange={(e) => handleTagChange('giftSet', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagGiftSet">Gift Set</label>
                </div>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="tagBulkOrder"
                    checked={tags.bulkOrder}
                    onChange={(e) => handleTagChange('bulkOrder', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tagBulkOrder">Bulk Order Available</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label>Custom Tags</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Enter custom tags separated by commas"
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
            />
            <small style={{ color: 'var(--secondary-color)' }}>Example: fresh, local, sustainable</small>
          </div>
          
          <div className="form-group mb-3">
            <label>Featured Category</label>
            <select 
              className="form-control"
              value={featuredCategory}
              onChange={(e) => setFeaturedCategory(e.target.value)}
            >
              <option value="">None</option>
              <option value="bestseller">Best Seller</option>
              <option value="new-arrival">New Arrival</option>
              <option value="featured">Featured Product</option>
              <option value="trending">Trending</option>
              <option value="editors-choice">Editor's Choice</option>
            </select>
          </div>
          
          <div className="form-group mb-3">
            <label>Search Keywords</label>
            <textarea 
              className="form-control" 
              rows="2" 
              placeholder="Enter keywords that customers might use to search for this product"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            ></textarea>
            <small style={{ color: 'var(--secondary-color)' }}>This helps customers find your product more easily</small>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-admin btn-admin-info" onClick={handleSubmit}>
            <i className="bi bi-check-circle me-1"></i>
            Update Categories
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategorizeProductModal