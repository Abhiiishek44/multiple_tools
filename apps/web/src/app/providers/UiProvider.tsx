import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { addFavorite, getFavorites, removeFavorite, syncFavorites } from '../../features/favorites/api'
import { useAuth } from '../../features/auth/context/useAuth'
import { UiContext, type Theme, type UiContextValue } from '../../shared/context/UiContext'

const THEME_KEY = 'multiple-tools-theme'
const FAVORITES_KEY = 'multiple-tools-favorites'

function initialTheme(): Theme {
  const saved = window.localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
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
  const { status, user } = useAuth()
  const guestModeReady = useRef(false)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [favorites, setFavorites] = useState<string[]>(initialFavorites)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (status === 'anonymous' && guestModeReady.current) {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  }, [favorites, status])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'anonymous') {
      setFavorites(initialFavorites())
      guestModeReady.current = true
      return
    }

    guestModeReady.current = false
    let active = true
    const guestFavorites = initialFavorites()
    const load = guestFavorites.length ? syncFavorites(guestFavorites) : getFavorites()
    void load.then((serverFavorites) => {
      if (!active) return
      setFavorites(serverFavorites)
      window.localStorage.removeItem(FAVORITES_KEY)
    }).catch(() => {
      // Keep the current list available when the API or cache is temporarily unavailable.
    })
    return () => { active = false }
  }, [status, user?.id])

  const toggleTheme = useCallback(() => setTheme((value) => value === 'light' ? 'dark' : 'light'), [])
  const toggleFavorite = useCallback((toolId: string) => {
    const wasFavorite = favorites.includes(toolId)
    const next = wasFavorite ? favorites.filter((item) => item !== toolId) : [...favorites, toolId]
    setFavorites(next)
    if (status !== 'authenticated') return

    const request = wasFavorite ? removeFavorite(toolId).then(() => next) : addFavorite(toolId)
    void request.then(setFavorites).catch(() => setFavorites(favorites))
  }, [favorites, status])
  const isFavorite = useCallback((toolId: string) => favorites.includes(toolId), [favorites])
  const value = useMemo<UiContextValue>(() => ({ theme, favorites, toggleTheme, toggleFavorite, isFavorite }), [favorites, isFavorite, theme, toggleFavorite, toggleTheme])

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
