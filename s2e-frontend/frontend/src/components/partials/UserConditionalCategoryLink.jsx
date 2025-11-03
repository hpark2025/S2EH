import { Link } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'

function UserConditionalCategoryLink({ children, className = "text-decoration-none", ...props }) {
  const { state } = useAppState()
  const { isLoggedIn } = state
  
  // Redirect to products page instead of categories page
  const destination = isLoggedIn ? '/auth/products' : '/user/products'
  
  return (
    <Link to={destination} className={className} {...props}>
      {children}
    </Link>
  )
}

export default UserConditionalCategoryLink