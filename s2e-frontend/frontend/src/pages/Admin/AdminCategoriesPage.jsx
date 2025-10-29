import { useState } from 'react'

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categories] = useState([
    {
      id: 1,
      name: 'Agriculture',
      description: 'Fresh produce and farm goods',
      icon: 'bi-tree',
      color: '#4caf50',
      products: 0,
      producers: 0,
      status: 'active'
    },
    {
      id: 2,
      name: 'Handicrafts',
      description: 'Handmade crafts and artwork',
      icon: 'bi-palette',
      color: '#ff9800',
      products: 0,
      producers: 0,
      status: 'active'
    },
    {
      id: 3,
      name: 'Food Processing',
      description: 'Processed and packaged foods',
      icon: 'bi-egg-fried',
      color: '#e91e63',
      products: 0,
      producers: 0,
      status: 'active'
    },
    {
      id: 4,
      name: 'Textiles',
      description: 'Fabrics and clothing items',
      icon: 'bi-scissors',
      color: '#9c27b0',
      products: 0,
      producers: 0,
      status: 'active'
    },
    {
      id: 5,
      name: 'Fisheries',
      description: 'Fresh and processed seafood',
      icon: 'bi-water',
      color: '#2196f3',
      products: 0,
      producers: 0,
      status: 'active'
    },
    {
      id: 6,
      name: 'Tourism',
      description: 'Tourism products and souvenirs',
      icon: 'bi-camera',
      color: '#795548',
      products: 0,
      producers: 0,
      status: 'active'
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCategories = categories.length
  const activeCategories = categories.filter(cat => cat.status === 'active').length
  const totalProducts = categories.reduce((sum, cat) => sum + cat.products, 0)
  const topCategory = categories.length > 0 ? categories.sort((a, b) => b.products - a.products)[0] : null

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setShowEditModal(true)
  }

  const CategoryCard = ({ category }) => (
    <div style={{ 
      border: '1px solid var(--admin-border)', 
      borderRadius: '8px', 
      padding: '20px', 
      background: 'white',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          backgroundColor: category.color, 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white' 
        }}>
          <i className={category.icon} style={{ fontSize: '24px' }}></i>
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{category.name}</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--secondary-color)' }}>{category.description}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>
            Products: <strong>{category.products}</strong>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>
            Producers: <strong>{category.producers}</strong>
          </div>
        </div>
        <span className={`status-badge ${category.status === 'active' ? 'status-active' : 'status-pending'}`}>
          {category.status === 'active' ? 'Active' : 'New'}
        </span>
      </div>
      <div className="action-buttons">
        <button 
          className="btn-admin btn-admin-outline" 
          title="Edit Category"
          style={{ 
            padding: '8px 12px', 
            borderRadius: '6px', 
            transition: 'all 0.3s ease' 
          }}
          onClick={() => handleEditCategory(category)}
        >
          <i className="bi bi-pencil"></i>
          <span style={{ marginLeft: '6px' }}>Edit</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Category Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Categories</div>
            <div className="stat-icon">
              <i className="bi bi-tags"></i>
            </div>
          </div>
          <div className="stat-value">{totalCategories}</div>
          <div className="stat-change positive">Available categories</div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-header">
            <div className="stat-title">Active Categories</div>
            <div className="stat-icon">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
          <div className="stat-value">{activeCategories}</div>
          <div className="stat-change positive">Categories marked as active</div>
        </div>
        
        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-title">Top Category</div>
            <div className="stat-icon">
              <i className="bi bi-award"></i>
            </div>
          </div>
          <div className="stat-value">{topCategory?.name}</div>
          <div className="stat-change">{topCategory?.products || 0} products</div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-header">
            <div className="stat-title">Products</div>
            <div className="stat-icon">
              <i className="bi bi-box"></i>
            </div>
          </div>
          <div className="stat-value">{totalProducts.toLocaleString()}</div>
          <div className="stat-change positive">Products in categories</div>
        </div>
      </div>

      {/* Categories Grid View */}
      <div className="admin-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div></div>
          <div className="d-flex gap-2">
            <input 
              type="search" 
              className="form-control" 
              placeholder="Search categories..." 
              style={{ width: '250px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className="btn-admin btn-admin-primary" 
              style={{ 
                padding: '12px 20px', 
                fontWeight: '600', 
                boxShadow: '0 2px 8px rgba(44, 133, 63, 0.3)', 
                transition: 'all 0.3s ease' 
              }}
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-circle"></i>
              <span style={{ marginLeft: '6px' }}>Add Category</span>
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: '20px', width: '100%' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px', 
            width: '100%' 
          }}>
            {filteredCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          
          {filteredCategories.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--secondary-color)' 
            }}>
              <i className="bi bi-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p>No categories found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Category</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="categoryName" className="form-label">Category Name</label>
                    <input type="text" className="form-control" id="categoryName" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="categoryDescription" className="form-label">Description</label>
                    <textarea className="form-control" id="categoryDescription" rows="3"></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="categoryIcon" className="form-label">Icon</label>
                    <input type="text" className="form-control" id="categoryIcon" placeholder="bi-icon-name" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="categoryColor" className="form-label">Color</label>
                    <input type="color" className="form-control" id="categoryColor" />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-primary">
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Category</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="editCategoryName" className="form-label">Category Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="editCategoryName" 
                      defaultValue={selectedCategory.name}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCategoryDescription" className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      id="editCategoryDescription" 
                      rows="3"
                      defaultValue={selectedCategory.description}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCategoryIcon" className="form-label">Icon</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="editCategoryIcon" 
                      defaultValue={selectedCategory.icon}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCategoryColor" className="form-label">Color</label>
                    <input 
                      type="color" 
                      className="form-control" 
                      id="editCategoryColor" 
                      defaultValue={selectedCategory.color}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}




