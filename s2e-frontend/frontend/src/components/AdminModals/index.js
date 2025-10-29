// AdminModals index.js - Central export file for all admin modals

// AdminUsersPage modals
export { 
  AddUserModal, 
  EditUserModal 
} from './AdminUsersPage'

// AdminProductsPage modals  
export {
  EditProductModal,
  ApproveProductModal,
  RejectProductModal,
  RestockProductModal,
  DeleteProductModal,
  ArchiveProductModal,
  CategorizeProductModal
} from './AdminProductsPage'

// AdminProducersPage modals
// export {
//   AddProducerModal,
//   EditProducerModal,
//   ApproveProducerModal,
//   RejectProducerModal,
//   ReactivateProducerModal,
//   RemoveProducerModal
// } from './AdminProducersPage'

// AdminMessagesPage modals
// export {
//   ComposeMessageModal,
//   ReplyMessageModal,
//   ArchiveMessageModal
// } from './AdminMessagesPage'

// AdminCategoriesPage modals
// export {
//   AddCategoryModal,
//   EditCategoryModal
// } from './AdminCategoriesPage'

// AdminOrdersPage modals
export {
  EditOrderModal,
  ViewOrderModal,
  UpdateStatusModal,
  CancelOrderModal,
  ProcessRefundModal
} from './AdminOrdersPage'