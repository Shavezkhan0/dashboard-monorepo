'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../Context/AuthContext'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/design/login')
        }
    }, [isAuthenticated, loading, router])

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // If not authenticated, don't render children (redirect will happen)
    if (!isAuthenticated()) {
        return null
    }

    // If authenticated, render the protected content
    return <>{children}</>
}

export default ProtectedRoute
