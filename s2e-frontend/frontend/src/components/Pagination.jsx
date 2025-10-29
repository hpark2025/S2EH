import { useState, useMemo } from 'react'

const usePagination = ({ 
  data, 
  itemsPerPageOptions = [5, 10, 15, 25, 50], 
  defaultItemsPerPage = 10,
  onPageChange 
}) => {
  console.log('Pagination hook received data:', data, 'length:', data?.length)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = data.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      if (onPageChange) {
        onPageChange(page, itemsPerPage)
      }
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
    if (onPageChange) {
      onPageChange(1, newItemsPerPage)
    }
  }

  if (data.length === 0) {
    console.log('Pagination: No data, returning null')
    return {
      currentItems: [],
      pagination: null,
      currentPage: 1,
      totalPages: 0,
      itemsPerPage,
      startIndex: 0,
      endIndex: 0
    }
  }

  console.log('Pagination: Rendering pagination with', totalPages, 'pages')

  // Generate page numbers for pagination
  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 7 // Show more pages like in the original design
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(i)}
              style={{
                color: currentPage === i ? 'white' : '#007bff',
                backgroundColor: currentPage === i ? '#007bff' : 'white',
                borderColor: '#dee2e6'
              }}
            >
              {i}
            </button>
          </li>
        )
      }
    } else {
      // Complex pagination with ellipsis
      let startPage, endPage
      
      if (currentPage <= 4) {
        // Near the beginning
        startPage = 1
        endPage = Math.min(5, totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        startPage = Math.max(totalPages - 4, 1)
        endPage = totalPages
      } else {
        // In the middle
        startPage = currentPage - 2
        endPage = currentPage + 2
      }
      
      // Always show first page
      if (startPage > 1) {
        pages.push(
          <li key={1} className="page-item">
            <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
          </li>
        )
        
        if (startPage > 2) {
          pages.push(
            <li key="ellipsis-start" className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )
        }
      }
      
      // Show the main range of pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(i)}
              style={{
                color: currentPage === i ? 'white' : '#007bff',
                backgroundColor: currentPage === i ? '#007bff' : 'white',
                borderColor: '#dee2e6'
              }}
            >
              {i}
            </button>
          </li>
        )
      }
      
      // Always show last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(
            <li key="ellipsis-end" className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )
        }
        
        pages.push(
          <li key={totalPages} className="page-item">
            <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          </li>
        )
      }
    }
    
    return pages
  }

  return {
    currentItems,
    pagination: (
      <nav aria-label="Table pagination" className="mt-5">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          
          {renderPageNumbers()}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    ),
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex
  }
}

export default usePagination