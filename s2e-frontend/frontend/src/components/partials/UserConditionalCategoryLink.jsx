import { Link } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'

function UserConditionalCategoryLink({ children, className = "text-decoration-none", ...props }) {
  const { state } = useAppState()
  const { isLoggedIn } = state
  
  // If user is logged in, go to categories page, otherwise go to login
  const destination = isLoggedIn ? '/auth/categories' : '/login'
  
  return (
    <Link to={destination} className={className} {...props}>
      {children}
    </Link>
  )
}

export default UserConditionalCategoryLink