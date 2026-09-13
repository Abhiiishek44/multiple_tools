import { useContext } from 'react'
import { UiContext } from './UiContext'

export function useUi() {
  const value = useContext(UiContext)
  if (!value) throw new Error('useUi must be used inside UiProvider')
  return value
}
