'use client'
import Image from 'next/image'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../Context/AuthContext'
import { useRouter } from 'next/navigation'

const Login = () => {
    const [formData, setFormData] = useState({
        uid: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { login, isAuthenticated } = useAuth()
    const router = useRouter()

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/design')
        }
    }, [isAuthenticated, router])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Add a small delay to show loading effect
            await new Promise(resolve => setTimeout(resolve, 100));

            const result = await login(formData);

            if (result.success) {
                console.log("Login successful!");
                router.push('/design');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (error) {
            console.error("Error during login:", error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-4 bg-white border-2 rounded-2xl px-10 py-10 shadow-blue-600 shadow-2xl">
                <div className='flex justify-center'>
                    <Image
                        className="cursor-pointer"
                        title="Indian Navy"
                        src="/logo.png"
                        alt="logo"
                        width={100}
                        height={100}
                    />
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="uid" className="sr-only">
                                User ID
                            </label>
                            <input
                                id="uid"
                                name="uid"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="User ID"
                                value={formData.uid}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center items-center px-[8px] py-[8px]
        border-2 border-indigo-300
        text-indigo-600
        bg-blue-50
        rounded-md
        text-sm font-medium
        hover:border-transparent
        hover:text-white
        hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        transition-all duration-200
        "
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
