const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000')

export const API_BASE_URL = `${rawApiBaseUrl.replace(/\/$/, '')}/api`
