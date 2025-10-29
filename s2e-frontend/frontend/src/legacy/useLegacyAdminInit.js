import { useEffect } from 'react'
import './admin-main.js'

export default function useLegacyAdminInit() {
  useEffect(() => {
    // The legacy script attaches DOM listeners on DOMContentLoaded.
    // In React, run once after mount.
  }, [])
}


