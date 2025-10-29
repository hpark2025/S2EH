# AdminModals Organization

This directory contains all modal components for the admin interface, organized by their respective admin pages for better maintainability and organization.

## Directory Structure

```
AdminModals/
├── index.js                      # Main export file for all admin modals
├── AdminUsersPage/               # Modals for user management
│   ├── index.js                 # Export file for user modals
│   ├── AddUserModal.jsx         # Modal for adding new users
│   └── EditUserModal.jsx        # Modal for editing user details
├── AdminProductsPage/            # Modals for product management
│   ├── index.js                 # Export file for product modals
│   ├── AddProductModal.jsx      # Modal for adding new products
│   ├── EditProductModal.jsx     # Modal for editing product details
│   ├── ApproveProductModal.jsx  # Modal for approving products
│   ├── RejectProductModal.jsx   # Modal for rejecting products
│   ├── RestockProductModal.jsx  # Modal for restocking products
│   ├── DeleteProductModal.jsx   # Modal for deleting products
│   └── CategorizeProductModal.jsx # Modal for categorizing products
├── AdminProducersPage/           # Modals for producer management
│   ├── index.js                 # Export file for producer modals
│   ├── AddProducerModal.jsx     # Modal for adding new producers
│   ├── EditProducerModal.jsx    # Modal for editing producer details
│   ├── ApproveProducerModal.jsx # Modal for approving producers
│   ├── RejectProducerModal.jsx  # Modal for rejecting producers
│   ├── ReactivateProducerModal.jsx # Modal for reactivating producers
│   └── RemoveProducerModal.jsx  # Modal for removing producers
├── AdminVerificationPage/        # Modals for LGU verification (REMOVED)
│   ├── index.js                 # Export file for verification modals
│   ├── AddApplicationModal.jsx  # Modal for new verification applications
│   ├── ApproveApplicationModal.jsx # Modal for approving applications
│   ├── RejectApplicationModal.jsx # Modal for rejecting applications
│   └── ViewCertificateModal.jsx # Modal for viewing certificates
├── AdminMessagesPage/            # Modals for message management
│   ├── index.js                 # Export file for message modals
│   ├── ComposeMessageModal.jsx  # Modal for composing new messages
│   ├── ReplyMessageModal.jsx    # Modal for replying to messages
│   └── ArchiveMessageModal.jsx  # Modal for archiving messages
├── AdminCategoriesPage/          # Modals for category management
│   ├── index.js                 # Export file for category modals
│   ├── AddCategoryModal.jsx     # Modal for adding new categories
│   └── EditCategoryModal.jsx    # Modal for editing categories
└── AdminOrdersPage/              # Modals for order management
    ├── index.js                 # Export file for order modals
    ├── AddOrderModal.jsx        # Modal for adding new orders
    ├── EditOrderModal.jsx       # Modal for editing order details
    └── CancelOrderModal.jsx     # Modal for canceling orders
```

## Usage

### Importing Modals

You can import modals in two ways:

1. **Import specific modals from the main index:**
```jsx
import { AddUserModal, EditUserModal } from '../../components/AdminModals'
```

2. **Import from specific page directory:**
```jsx
import { AddUserModal, EditUserModal } from '../../components/AdminModals/AdminUsersPage'
```

### Using Modals in Components

```jsx
import { AddUserModal, EditUserModal } from '../../components/AdminModals'

function AdminUsersPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  return (
    <>
      {/* Your page content */}
      
      <AddUserModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(userData) => {
          // Handle user addition
          console.log('Adding user:', userData)
        }}
      />
      
      <EditUserModal 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={(userId, userData) => {
          // Handle user editing
          console.log('Editing user:', userId, userData)
        }}
        user={selectedUser}
      />
    </>
  )
}
```

## Modal Component Structure

Each modal component follows this standard structure:

1. **Props**: Includes `show`, `onClose`, and specific action handlers
2. **State Management**: Uses local state for form data
3. **Form Handling**: Includes proper form validation and submission
4. **PropTypes**: All components include PropTypes for type checking
5. **Consistent Styling**: Uses admin CSS classes for consistent appearance

## Completed Components

- ✅ **AdminUsersPage modals**: AddUserModal, EditUserModal
- ✅ **AdminProductsPage modals**: AddProductModal (example created)
- 📋 **Other page modals**: Placeholder structure created

## Benefits of This Organization

1. **Better Maintainability**: Each page's modals are grouped together
2. **Cleaner Imports**: Easy to import only the modals you need
3. **Consistent Structure**: Follows the same pattern as SellerModals and UserModals
4. **Scalability**: Easy to add new modals or modify existing ones
5. **Reusability**: Modals can be reused across different admin pages if needed

## Implementation Status

The structure has been successfully implemented and tested:
- ✅ Directory structure created
- ✅ Main index.js file with all exports
- ✅ AdminUsersPage integrated with new modal components
- ✅ Build test passed successfully
- ✅ Consistent with existing SellerModals and UserModals patterns