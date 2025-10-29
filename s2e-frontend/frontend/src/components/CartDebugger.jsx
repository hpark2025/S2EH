import React, { useState, useEffect } from 'react'
import { cartAPI } from '../services/cartAPI'
import { productsAPI } from '../services/authAPI'

export default function CartDebugger() {
  const [regions, setRegions] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load regions
      console.log('🔍 Loading regions...')
      const regionsResponse = await cartAPI.getRegions()
      setRegions(regionsResponse.regions || [])
      console.log('🔍 Regions loaded:', regionsResponse.regions)

      // Load products
      console.log('🔍 Loading products...')
      const productsResponse = await productsAPI.getProducts({ limit: 5 })
      setProducts(productsResponse.products || [])
      console.log('🔍 Products loaded:', productsResponse.products)

      // Try to get cart
      try {
        console.log('🔍 Loading cart...')
        const cartResponse = await cartAPI.getCart()
        setCart(cartResponse.cart)
        console.log('🔍 Cart loaded:', cartResponse.cart)
        console.log('🔍 Cart region:', cartResponse.cart.region)
      } catch (cartError) {
        console.warn('🔍 Cart not available:', cartError.message)
      }

    } catch (err) {
      console.error('🔍 Failed to load data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testVariantPricing = async (product) => {
    try {
      setLoading(true)
      setError(null)

      const variantId = product.variant_id
      console.log('🔍 Testing variant pricing for:', variantId)

      if (!variantId) {
        throw new Error('No variant_id found for product')
      }

      // Test variant pricing validation
      const variant = await cartAPI.validateVariantPricing(variantId)
      console.log('🔍 Variant pricing validation result:', variant)
      
      alert(`✅ Variant pricing validation passed!\n\nVariant ID: ${variant.id}\nPrices: ${variant.prices?.length || 0}\nCalculated Price: ${variant.calculated_price ? 'Available' : 'Not Available'}`)

    } catch (err) {
      console.error('🔍 Variant pricing test failed:', err)
      setError(err.message)
      alert(`❌ Variant pricing test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

    const testAddToCart = async (product) => {
    try {
      setLoading(true)
      setError(null)

      // Use variant_id directly from product response
      const variantId = product.variant_id
      console.log('🔍 Testing add to cart with variant_id:', variantId)
      console.log('🔍 Product variant_id:', product.variant_id)

      if (!variantId) {
        throw new Error('No variant_id found for product')
      }

      // Add to cart directly
      console.log('🔍 Adding to cart...')
      const result = await cartAPI.addItem(variantId, 1, {
        product_id: product.id,
        product_title: product.title
      })

      console.log('🔍 Add to cart result:', result)
      setCart(result.cart)
      alert('✅ Successfully added to cart!')

    } catch (err) {
      console.error('🔍 Add to cart failed:', err)
      setError(err.message)
      alert(`❌ Failed to add to cart: ${err.message}`)
    } finally {
      setLoading(false)
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
        <h5 className="mb-0">🛒 Cart Debugger</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Regions */}
        <div className="mb-4">
          <h6>Regions ({regions.length})</h6>
          {regions.length > 0 ? (
            <div className="list-group">
              {regions.map(region => (
                <div key={region.id} className="list-group-item">
                  <strong>{region.name}</strong> ({region.id})
                  <br />
                  <small className="text-muted">
                    Currency: {region.currency_code} | 
                    Countries: {region.countries?.map(c => c.iso_2).join(', ')}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No regions found</p>
          )}
        </div>

        {/* Products */}
        <div className="mb-4">
          <h6>Products ({products.length})</h6>
          {products.length > 0 ? (
            <div className="row">
              {products.map(product => {
                const variantId = product.variant_id
                const variant = product.first_variant || product.variants?.[0]
                
                return (
                  <div key={product.id} className="col-md-6 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">{product.title}</h6>
                        <p className="card-text">
                          <strong>Variant ID:</strong> {variantId || 'None'}<br />
                          <strong>First Variant ID:</strong> {product.first_variant?.id || 'None'}<br />
                          <strong>Variants Array:</strong> {product.variants?.length || 0} items<br />
                          <strong>Variant Title:</strong> {variant?.title || 'None'}<br />
                          <strong>Pricing:</strong> {variant?.pricing ? 'Yes' : 'No'}<br />
                          <strong>Calculated Price:</strong> {variant?.calculated_price ? 'Yes' : 'No'}<br />
                          <strong>Inventory:</strong> {variant?.inventory_quantity || 0}
                        </p>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => testVariantPricing(product)}
                            disabled={!variantId || loading}
                          >
                            Test Pricing
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => testAddToCart(product)}
                            disabled={!variantId || loading}
                          >
                            Test Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted">No products found</p>
          )}
        </div>

        {/* Current Cart */}
        <div className="mb-4">
          <h6>Current Cart</h6>
          {cart ? (
            <div className="card">
              <div className="card-body">
                <p><strong>Cart ID:</strong> {cart.id}</p>
                <p><strong>Region:</strong> {cart.region?.name || 'None'} ({cart.region_id})</p>
                <p><strong>Items:</strong> {cart.items?.length || 0}</p>
                <p><strong>Total:</strong> ₱{((cart.total || 0) / 100).toFixed(2)}</p>
                
                {cart.items && cart.items.length > 0 && (
                  <div className="mt-3">
                    <h6>Items:</h6>
                    {cart.items.map(item => (
                      <div key={item.id} className="border-bottom py-2">
                        <strong>{item.title}</strong><br />
                        <small>
                          Variant: {item.variant_id} | 
                          Qty: {item.quantity} | 
                          Price: ₱{((item.unit_price || 0) / 100).toFixed(2)}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted">No cart available</p>
          )}
        </div>

        <button className="btn btn-outline-primary" onClick={loadData}>
          Refresh Data
        </button>
      </div>
    </div>
  )
}


