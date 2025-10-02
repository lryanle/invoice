"use client"

import { useState, useEffect, useCallback } from "react"

interface CSRFTokenState {
  token: string | null
  loading: boolean
  error: string | null
}

export function useCSRF() {
  const [state, setState] = useState<CSRFTokenState>({
    token: null,
    loading: false,
    error: null,
  })

  const fetchToken = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token")
      }
      
      const data = await response.json()
      setState({
        token: data.token,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }, [])

  const getToken = useCallback(async () => {
    if (state.token) {
      return state.token
    }
    
    await fetchToken()
    return state.token
  }, [state.token, fetchToken])

  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  return {
    token: state.token,
    loading: state.loading,
    error: state.error,
    refetch: fetchToken,
    getToken,
  }
}
