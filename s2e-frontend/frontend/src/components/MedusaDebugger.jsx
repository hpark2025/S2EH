import React, { useState, useEffect } from 'react'
import { productsAPI } from '../services/authAPI'
import { cartAPI } from '../services/cartAPI'

export default function MedusaDebugger() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Loading products for debugging...')
      const response = await productsAPI.getProducts({ limit: 3 })
      console.log('🔍 Products response:', response)
      
      if (response.products && response.products.length > 0) {
        setProducts(response.products)
        
        // Log detailed product structure
        response.products.forEach((product, index) => {
          console.log(`🔍 Product ${index + 1} structure:`, {
            id: product.id,
            title: product.title,
            variant_id: product.variant_id,
            first_variant: product.first_variant,
            variants: product.variants,
            pricing: product.pricing,
            calculated_price: product.calculated_price
          })
        })
      }
    } catch (err) {
      console.error('🔍 Failed to load products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testVariantPricing = async (product) => {
    try {
      console.log('🔍 Testing variant pricing for product:', product.title)
      
      // Check if product has pricing information
      if (product.first_variant) {
        console.log('🔍 First variant details:', {
          id: product.first_variant.id,
          title: product.first_variant.title,
          pricing: product.first_variant.pricing,
          calculated_price: product.first_variant.calculated_price,
          manage_inventory: product.first_variant.manage_inventory,
          inventory_quantity: product.first_variant.inventory_quantity
        })
      }
      
      if (product.variants && product.variants.length > 0) {
        console.log('🔍 Variants array details:', product.variants.map(v => ({
          id: v.id,
          title: v.title,
          pricing: v.pricing,
          calculated_price: v.calculated_price,
          manage_inventory: v.manage_inventory,
          inventory_quantity: v.inventory_quantity
        })))
      }
      
      // Try to get variant details from store API
      const variantId = product.first_variant?.id || product.variants?.[0]?.id
      if (variantId) {
        try {
          console.log('🔍 Fetching variant details from store API...')
          const response = await fetch(`/store/variants/${variantId}`, {
            headers: {
              'x-publishable-api-key': 'pk_01H1234567890abcdef' // You may need to update this
            }
          })
          const variantData = await response.json()
          console.log('🔍 Store API variant response:', variantData)
        } catch (apiError) {
          console.error('🔍 Store API variant fetch failed:', apiError)
        }
      }
      
    } catch (err) {
      console.error('🔍 Variant pricing test failed:', err)
    }
  }

  const testRegions = async () => {
    try {
      console.log('🔍 Testing regions...')
      const regionsResponse = await cartAPI.getRegions()
      console.log('🔍 Regions result:', regionsResponse)
      
      if (regionsResponse.regions && regionsResponse.regions.length > 0) {
        console.log('🔍 Available regions:', regionsResponse.regions.map(r => ({
          id: r.id,
          name: r.name,
          currency_code: r.currency_code,
          tax_rate: r.tax_rate
        })))
      }
    } catch (err) {
      console.error('🔍 Regions test failed:', err)
    }
  }

  const testCartCreation = async () => {
    try {
      console.log('🔍 Testing cart creation...')
      const cartResponse = await cartAPI.getCart()
      console.log('🔍 Cart creation result:', cartResponse)
    } catch (err) {
      console.error('🔍 Cart creation failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading debug data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">🔧 Medusa Backend Debugger</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mb-4">
          <h6>Products ({products.length})</h6>
          {products.length > 0 ? (
            <div className="row">
              {products.map((product, index) => (
                <div key={product.id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">{product.title}</h6>
                      <div className="mb-2">
                        <strong>Product ID:</strong> {product.id}<br />
                        <strong>Variant ID:</strong> {product.variant_id || 'None'}<br />
                        <strong>First Variant ID:</strong> {product.first_variant?.id || 'None'}<br />
                        <strong>Variants Count:</strong> {product.variants?.length || 0}
                      </div>
                      
                      {product.first_variant && (
                        <div className="mb-2">
                          <strong>First Variant Details:</strong><br />
                          <small>
                            Pricing: {product.first_variant.pricing ? 'Yes' : 'No'}<br />
                            Calculated Price: {product.first_variant.calculated_price ? 'Yes' : 'No'}<br />
                            Manage Inventory: {product.first_variant.manage_inventory ? 'Yes' : 'No'}<br />
                            Inventory Qty: {product.first_variant.inventory_quantity || 0}
                          </small>
                        </div>
                      )}
                      
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => testVariantPricing(product)}
                        >
                          Test Variant Pricing
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No products found</p>
          )}
        </div>

        <div className="mb-4">
          <button className="btn btn-primary me-2" onClick={loadProducts}>
            Refresh Products
          </button>
          <button className="btn btn-outline-primary me-2" onClick={testRegions}>
            Test Regions
          </button>
          <button className="btn btn-outline-primary" onClick={testCartCreation}>
            Test Cart Creation
          </button>
        </div>

        <div className="alert alert-info">
          <h6>Debugging Steps:</h6>
          <ol>
            <li>Check the console logs for detailed product structure</li>
            <li>Look for products with missing pricing information</li>
            <li>Verify that variants have proper pricing configured</li>
            <li>Check if the Medusa backend has proper regions and price lists</li>
          </ol>
        </div>
      </div>
    </div>
  )
}