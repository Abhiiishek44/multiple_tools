import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UiContext, type Theme, type UiContextValue } from '../../shared/context/UiContext'

const THEME_KEY = 'multiple-tools-theme'
const FAVORITES_KEY = 'multiple-tools-favorites'

function initialTheme(): Theme {
  const saved = window.localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initialFavorites() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function UiProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [favorites, setFavorites] = useState<string[]>(initialFavorites)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)), [favorites])

  const toggleTheme = useCallback(() => setTheme((value) => value === 'light' ? 'dark' : 'light'), [])
  const toggleFavorite = useCallback((toolId: string) => setFavorites((items) => items.includes(toolId) ? items.filter((item) => item !== toolId) : [...items, toolId]), [])
  const isFavorite = useCallback((toolId: string) => favorites.includes(toolId), [favorites])
  const value = useMemo<UiContextValue>(() => ({ theme, favorites, toggleTheme, toggleFavorite, isFavorite }), [favorites, isFavorite, theme, toggleFavorite, toggleTheme])

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
