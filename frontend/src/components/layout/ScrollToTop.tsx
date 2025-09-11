import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop(): React.ReactElement | null {
	const { pathname } = useLocation()

	useEffect(() => {
		// Scroll to the top smoothly on route changes
		window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
	}, [pathname])

	return null
}


