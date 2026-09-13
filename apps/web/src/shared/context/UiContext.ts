import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export type UiContextValue = {
  theme: Theme
  favorites: string[]
  toggleTheme: () => void
  toggleFavorite: (toolId: string) => void
  isFavorite: (toolId: string) => boolean
}

export const UiContext = createContext<UiContextValue | null>(null)
