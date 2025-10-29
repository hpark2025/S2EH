export default function UserFooter() {
  return (
    <footer className="bg-light py-5 border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">
              <i className="bi bi-headset me-2"></i>Customer Service
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-question-circle me-2"></i>Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-truck me-2"></i>Order Tracking
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-box-seam me-2"></i>Shipping Policy
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-arrow-return-left me-2"></i>Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-chat-dots me-2"></i>Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">
              <i className="bi bi-info-circle me-2"></i>About S2EH
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-building me-2"></i>About Us
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-briefcase me-2"></i>LGU Partnership
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-people me-2"></i>Producer Stories
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-person-workspace me-2"></i>Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-muted d-flex align-items-center bg-light p-2 rounded">
                  <i className="bi bi-shield-lock me-2"></i>Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">
              <i className="bi bi-credit-card me-2"></i>Payment
            </h6>
            <div className="row g-2">
              <div className="col-6">
                <div className="payment-logo bg-white p-2 rounded border d-flex align-items-center justify-content-center" style={{ height: 50 }}>
                  <img src="https://aimg.kwcdn.com/upload_aimg/payment/7bacbe25-56f3-4b84-a82f-046777896662.png.slim.png?imageView2/2/w/120/q/70/format/webp" alt="GCash" style={{ maxHeight: 30, maxWidth: '100%' }} />
                </div>
              </div>
              <div className="col-6">
                <div className="payment-logo bg-white p-2 rounded border d-flex align-items-center justify-content-center" style={{ height: 50 }}>
                  <i className="bi bi-cash-coin" style={{ fontSize: '1.75rem', color: '#28a745' }}></i>
                </div>
              </div>
            </div>

            <h6 className="text-uppercase fw-bold mb-3 mt-4">
              <i className="bi bi-truck-flatbed me-2"></i>Logistics
            </h6>
            <div className="row g-2">
              <div className="col-4">
                <div className="logistics-logo bg-white p-2 rounded border d-flex align-items-center justify-content-center" style={{ height: 50 }}>
                  <img src="https://down-ph.img.susercontent.com/file/ph-50009109-0c5dd5687ff2ede525c04fbde2f7b7fd" alt="SPX" style={{ maxHeight: 30, maxWidth: '100%' }} />
                </div>
              </div>
              <div className="col-4">
                <div className="logistics-logo bg-white p-2 rounded border d-flex align-items-center justify-content-center" style={{ height: 50 }}>
                  <img src="https://down-ph.img.susercontent.com/file/631b5315df5e2e7a6360553c48c7b394" alt="Flash Express" style={{ maxHeight: 30, maxWidth: '100%' }} />
                </div>
              </div>
              <div className="col-4">
                <div className="logistics-logo bg-white p-2 rounded border d-flex align-items-center justify-content-center" style={{ height: 50 }}>
                  <img src="https://down-ph.img.susercontent.com/file/f08425e0b60ba5040a7d490d6cf4a7c4" alt="J&T Express" style={{ maxHeight: 30, maxWidth: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">
              <i className="bi bi-globe me-2"></i>Follow Us
            </h6>
            <div className="social-links d-flex flex-wrap">
              <a href="#" className="social-icon me-2 mb-2 bg-light p-2 rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                <i className="bi bi-facebook text-primary fs-5"></i>
              </a>
            </div>

            <div className="mt-3">
              <h6 className="text-uppercase fw-bold mb-2">
                <i className="bi bi-building-check me-2"></i>LGU Partners
              </h6>
              <div className="lgu-logo bg-light p-2 rounded d-inline-block d-flex align-items-center justify-content-center" style={{ height: 80, width: 80 }}>
                <img src="/images/lgu-sagnay.jpg" alt="LGU Sagnay" style={{ maxHeight: 70, maxWidth: '100%' }} />
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">
              <i className="bi bi-phone me-2"></i>S2EH App Download
            </h6>
            <div className="d-flex mb-3">
              <div className="qr-code me-3 bg-light p-2 rounded d-flex align-items-center justify-content-center" style={{ height: 100, width: 100 }}>
                <img src="/images/qr-code-ex.svg" alt="QR Code" style={{ maxHeight: 110, maxWidth: '100%' }} />
              </div>
              <div className="app-buttons">
                <div className="app-button mb-2 bg-light p-1 rounded d-flex align-items-center justify-content-center" style={{ height: 40, width: 120 }}>
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" style={{ maxHeight: 80, maxWidth: '100%' }} />
                </div>
                <div className="app-button mb-2 bg-light p-1 rounded d-flex align-items-center justify-content-center" style={{ height: 40, width: 120 }}>
                  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Google Play" style={{ maxHeight: 80, maxWidth: '110%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr />

        <div className="row mb-3">
          <div className="col-12">
            <h6 className="text-uppercase fw-bold mb-3">
              <i className="bi bi-geo-alt me-2"></i>Regions Served
            </h6>
            <div className="d-flex flex-wrap">
              {['Bicol Region', 'Metro Manila', 'Calabarzon', 'Central Luzon', 'Western Visayas', 'Central Visayas', 'Davao Region'].map((r) => (
                <a key={r} href="#" className="region-link text-muted me-3 mb-2 bg-light p-2 rounded">
                  <i className="bi bi-geo me-1"></i>{r}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-muted mb-0">
            <i className="bi bi-c-circle me-1"></i>2025 From Sagnay to Every Home. All rights reserved.
          </p>
          <p className="text-muted small">
            <i className="bi bi-shop me-1"></i>An e-commerce platform connecting local producers in Sagnay, Camarines Sur with customers nationwide.
          </p>
        </div>
      </div>
    </footer>
  )
}

