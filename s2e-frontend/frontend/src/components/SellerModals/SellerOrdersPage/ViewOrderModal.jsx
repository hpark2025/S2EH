import PropTypes from 'prop-types';

export default function ViewOrderModal({ show, onClose, order, onProcess }) {
  if (!show) return null;

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-warning text-dark',
      'processing': 'bg-info',
      'shipped': 'bg-primary',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-warning text-dark',
      'paid': 'bg-success',
      'failed': 'bg-danger',
      'refunded': 'bg-info'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye me-2"></i>
              Order Details
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {order ? (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Order ID:</strong>
                  <p className="mb-1 font-monospace">{order.id}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Order Date:</strong>
                  <p className="mb-1">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Customer:</strong>
                  <p className="mb-1">{order.customer?.name || order.customer}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Total Amount:</strong>
                  <p className="mb-1 fw-bold text-success">₱{parseFloat(order.total).toFixed(2)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Payment Method:</strong>
                  <p className="mb-1">{order.paymentMethod}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Payment Status:</strong>
                  <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                    {order.paymentStatus?.toUpperCase()}
                  </span>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Order Status:</strong>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status?.toUpperCase()}
                  </span>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Delivery Address:</strong>
                  <p className="mb-1">{order.address}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
                <p className="mt-2 text-muted">No order data available</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-1"></i>Close
            </button>
            {onProcess && order && order.status === 'pending' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onProcess}
              >
                <i className="bi bi-gear me-1"></i>
                Process Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ViewOrderModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onProcess: PropTypes.func,
};