'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(null)
    const router = useRouter()

    // Check for existing token on app load
    useEffect(() => {
        const storedData = localStorage.getItem('token')
        
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData)
                
                // Check if token is expired
                if (parsedData.expiry && new Date(parsedData.expiry) > new Date()) {
                    setToken(parsedData)
                    setUser(parsedData.user || parsedData.uid || 'user')
                } else {
                    // Token expired, remove it
                    localStorage.removeItem('token')
                }
            } catch (error) {
                console.error('Error parsing stored token data:', error)
                localStorage.removeItem('token')
            }
        }
        setLoading(false)
    }, [])

    // Login function
    const login = async (credentials) => {


        // if (credentials.uid=="svk" && credentials.password=="svk"){
        //     const data = {
        //         token: 'shavez_khan_auth',
        //         user: 'shavez_khan',
        //         expiry: new Date(Date.now() + 2*60*60*1000).toISOString()
        //     } 
        //     setToken(data)
        //     localStorage.setItem('token', JSON.stringify(data))
                
        //     console.log('Login successful, data stored:', data)
        //     return { success: true, data }
        // }else{
        //     console.error('Login failed: Invalid credentials')
        //     return { success: false, error: 'Invalid username or password' }
        // }


        try {
            const login_api = process.env.NEXT_PUBLIC_BACKEND_LOGIN_API
    
            const response = await fetch(`${login_api}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            })

            const data = await response.json()

            if (response.ok) {
                // Add expiry for 2 hours to the backend data
                data.expiry = new Date(Date.now() + 2*60*60*1000).toISOString();
                
                // Set token and user from backend data
                setToken(data)
                setUser(data.user || data.uid || credentials.uid)
                
                // Store complete data in localStorage
                localStorage.setItem('token', JSON.stringify(data))
                
                console.log('Login successful, data stored:', data)
                return { success: true, data }
            } else {
                return { success: false, error: data.message || 'Login failed' }
            }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: 'Network error' }
        }
    }

    // Logout function
    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        router.push('/design/login')
    }

    // Check if user is authenticated
    const isAuthenticated = () => {
        if (!token) return false
        
        // Check if token is expired
        if (token.expiry && new Date(token.expiry) <= new Date()) {
            logout() // Auto logout if expired
            return false
        }
        
        return true
    }

    // Verify token validity (you can call this periodically)
    const verifyToken = async () => {
        if (!token) return false

        try {
            const BasePort = process.env.NEXT_PUBLIC_BACKEND_BASE_PORT
            let API_BASE = ""
            if (typeof window !== "undefined") {
                API_BASE = `${window.location.protocol}//${window.location.hostname}:${BasePort}`
            }

            const response = await fetch(`${API_BASE}/verify-token`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                logout()
                return false
            }
            return true
        } catch (error) {
            console.error('Token verification error:', error)
            logout()
            return false
        }
    }

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        verifyToken
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
