import { useEffect } from 'react'

export default function useSectionScripts(section) {
  useEffect(() => {
    // Future: dynamically import specific legacy scripts per section
    // Example:
    // if (section === 'user-home') import('../../../scripts/ui/modals.js')
  }, [section])
}


