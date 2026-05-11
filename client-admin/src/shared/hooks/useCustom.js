import { useState, useCallback } from 'react'
import { debounce } from '../utils/performance.js'

export const useSearch = (initialValue = '') => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  
  const debouncedSetSearch = useCallback(
    debounce((term) => setSearchTerm(term), 300),
    []
  )

  const handleSearchChange = useCallback((value) => {
    debouncedSetSearch(value)
  }, [debouncedSetSearch])

  return {
    searchTerm,
    handleSearchChange,
    clearSearch: useCallback(() => setSearchTerm(''), [])
  }
}

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}
