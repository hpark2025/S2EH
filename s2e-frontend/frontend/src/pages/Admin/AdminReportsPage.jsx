import { useState, useMemo } from 'react'

const AdminReportsPage = () => {
  const [saleReportConfig, setSaleReportConfig] = useState({
    dateRange: 'Last 30 days',
    format: 'PDF'
  })

  const [orderReportConfig, setOrderReportConfig] = useState({
    orderStatus: 'All Orders',
    format: 'PDF'
  })

  const [productReportConfig, setProductReportConfig] = useState({
    category: 'All Categories',
    format: 'PDF'
  })

  const [loadingStates, setLoadingStates] = useState({
    sale: false,
    order: false,
    product: false
  })

  const handleReportGeneration = async (reportType, config) => {
    setLoadingStates(prev => ({ ...prev, [reportType]: true }))
    
    try {
      // Simulate API call for report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report generated successfully!\nConfiguration: ${JSON.stringify(config, null, 2)}`)
    } catch (error) {
      alert('Error generating report. Please try again.')
    } finally {
      setLoadingStates(prev => ({ ...prev, [reportType]: false }))
    }
  }

  const StatCard = ({ title, value, change, icon, variant = 'default' }) => (
    <div className={`stat-card ${variant}`}>
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className="stat-icon">
          <i className={icon}></i>
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${change.type}`}>{change.text}</div>
    </div>
  )

  const MiniStatCard = ({ title, value, change, icon, variant = 'default' }) => (
    <div className={`stat-card ${variant}`} style={{ padding: '15px' }}>
      <div className="stat-header">
        <div className="stat-title" style={{ fontSize: '12px' }}>{title}</div>
        <div className="stat-icon">
          <i className={icon} style={{ fontSize: '16px' }}></i>
        </div>
      </div>
      <div className="stat-value" style={{ fontSize: '20px', margin: '8px 0' }}>{value}</div>
      <div className={`stat-change ${change.type}`} style={{ fontSize: '11px' }}>{change.text}</div>
    </div>
  )

  const ReportGeneratorCard = ({ title, icon, config, onConfigChange, onGenerate, isLoading, fields, buttonClass = 'btn-admin-primary' }) => (
    <div className="admin-card">
      <div className="card-header">
        <h3 className="card-title">
          <i className={icon}></i>
          {title}
        </h3>
      </div>
      <div className="card-body">
        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              {field.label}:
            </label>
            <select 
              className="form-control"
              value={config[field.key]}
              onChange={(e) => onConfigChange({ ...config, [field.key]: e.target.value })}
            >
              {field.options.map((option, optIndex) => (
                <option key={optIndex} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        <button 
          className={`btn-admin ${buttonClass}`}
          style={{ 
            width: '100%', 
            boxShadow: buttonClass === 'btn-admin-primary' ? '0 2px 8px rgba(44, 133, 63, 0.3)' : undefined
          }}
          onClick={() => onGenerate(config)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="bi bi-hourglass-split"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-text"></i>
              {title}
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Report Generation Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <ReportGeneratorCard
          title="Generate Sale Report"
          icon="bi bi-graph-up"
          config={saleReportConfig}
          onConfigChange={setSaleReportConfig}
          onGenerate={(config) => handleReportGeneration('sale', config)}
          isLoading={loadingStates.sale}
          fields={[
            {
              label: 'Date Range',
              key: 'dateRange',
              options: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months', 'Custom range']
            },
            {
              label: 'Format',
              key: 'format',
              options: ['PDF', 'Excel', 'CSV']
            }
          ]}
        />

        <ReportGeneratorCard
          title="Generate Order Report"
          icon="bi bi-cart3"
          config={orderReportConfig}
          onConfigChange={setOrderReportConfig}
          onGenerate={(config) => handleReportGeneration('order', config)}
          isLoading={loadingStates.order}
          buttonClass="btn-admin-secondary"
          fields={[
            {
              label: 'Order Status',
              key: 'orderStatus',
              options: ['All Orders', 'Completed', 'Processing', 'Pending', 'Cancelled']
            },
            {
              label: 'Format',
              key: 'format',
              options: ['PDF', 'Excel', 'CSV']
            }
          ]}
        />

        <ReportGeneratorCard
          title="Generate Product Report"
          icon="bi bi-box"
          config={productReportConfig}
          onConfigChange={setProductReportConfig}
          onGenerate={(config) => handleReportGeneration('product', config)}
          isLoading={loadingStates.product}
          buttonClass="btn-admin-accent"
          fields={[
            {
              label: 'Category',
              key: 'category',
              options: ['All Categories', 'Agricultural', 'Handicrafts', 'Food Products', 'Textiles']
            },
            {
              label: 'Format',
              key: 'format',
              options: ['PDF', 'Excel', 'CSV']
            }
          ]}
        />
      </div>

      {/* Key Metrics Overview */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value="₱0"
          change={{ type: 'positive', text: 'Generated revenue from sales' }}
          icon="bi bi-currency-peso"
        />
        
        <StatCard
          title="Total Orders"
          value="0"
          change={{ type: 'positive', text: 'Orders processed' }}
          icon="bi bi-cart3"
          variant="highlight"
        />
        
        <StatCard
          title="New Customers"
          value="0"
          change={{ type: 'positive', text: 'Registered customers' }}
          icon="bi bi-person-plus"
          variant="accent"
        />
        
        <StatCard
          title="Avg. Order Value"
          value="₱0"
          change={{ type: 'positive', text: 'Average order amount' }}
          icon="bi bi-graph-up"
          variant="secondary"
        />
      </div>

      {/* Quick Report Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        {/* Sales Report */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Sales Report</h3>
          </div>
          <div className="card-body" style={{ padding: '15px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              <MiniStatCard
                title="Total Sales"
                value="₱0"
                change={{ type: 'positive', text: 'Revenue from all sales' }}
                icon="bi bi-currency-peso"
              />
              
              <MiniStatCard
                title="Daily Average"
                value="₱0"
                change={{ type: 'positive', text: 'Average daily revenue' }}
                icon="bi bi-graph-up"
                variant="accent"
              />

              <MiniStatCard
                title="Top Category"
                value="Agriculture"
                change={{ type: 'positive', text: 'Leading product category' }}
                icon="bi bi-trophy"
                variant="highlight"
              />
            </div>
          </div>
        </div>

        {/* Order Report */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Order Report</h3>
          </div>
          <div className="card-body" style={{ padding: '15px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              <MiniStatCard
                title="Total Orders"
                value="0"
                change={{ type: 'positive', text: 'Orders processed' }}
                icon="bi bi-cart3"
              />
              
              <MiniStatCard
                title="Completed Orders"
                value="0"
                change={{ type: 'positive', text: 'Successfully completed' }}
                icon="bi bi-check-circle"
                variant="secondary"
              />

              <MiniStatCard
                title="Pending Orders"
                value="0"
                change={{ type: 'neutral', text: 'Currently processing' }}
                icon="bi bi-clock"
                variant="accent"
              />
            </div>
          </div>
        </div>

        {/* Product Report */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Product Report</h3>
          </div>
          <div className="card-body" style={{ padding: '15px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              <MiniStatCard
                title="Total Products"
                value="0"
                change={{ type: 'positive', text: 'Products available' }}
                icon="bi bi-box"
              />
              
              <MiniStatCard
                title="Best Seller"
                value="None"
                change={{ type: 'positive', text: 'Top selling product' }}
                icon="bi bi-star"
                variant="highlight"
              />

              <MiniStatCard
                title="Low Stock"
                value="0"
                change={{ type: 'neutral', text: 'Items need restocking' }}
                icon="bi bi-exclamation-triangle"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Section */}
      <div className="admin-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-graph-up"></i>
            Analytics Overview
          </h3>
        </div>
        <div className="card-body">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid var(--admin-border)', 
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(44, 133, 63, 0.1) 0%, rgba(44, 133, 63, 0.05) 100%)'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                marginBottom: '12px',
                color: 'var(--primary-color)'
              }}>
                Revenue Trends
              </h4>
              <div style={{ fontSize: '14px', color: 'var(--secondary-color)', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>• Monthly growth: 0%</div>
                <div style={{ marginBottom: '8px' }}>• Quarter growth: 0%</div>
                <div style={{ marginBottom: '8px' }}>• Peak sales day: N/A</div>
                <div>• Best performing hour: N/A</div>
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              border: '1px solid var(--admin-border)', 
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                marginBottom: '12px',
                color: '#e0a800'
              }}>
                Customer Insights
              </h4>
              <div style={{ fontSize: '14px', color: 'var(--secondary-color)', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>• Customer retention: 0%</div>
                <div style={{ marginBottom: '8px' }}>• Avg. session duration: 0m 0s</div>
                <div style={{ marginBottom: '8px' }}>• Most active region: N/A</div>
                <div>• Preferred payment: N/A</div>
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              border: '1px solid var(--admin-border)', 
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                marginBottom: '12px',
                color: '#dc3545'
              }}>
                Performance Metrics
              </h4>
              <div style={{ fontSize: '14px', color: 'var(--secondary-color)', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>• Page load time: 0s</div>
                <div style={{ marginBottom: '8px' }}>• Conversion rate: 0%</div>
                <div style={{ marginBottom: '8px' }}>• Cart abandonment: 0%</div>
                <div>• Mobile traffic: 0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminReportsPage


