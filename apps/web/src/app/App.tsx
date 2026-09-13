import { AppRouter } from './router'
import { AuthProvider } from './providers/AuthProvider'
import { UiProvider } from './providers/UiProvider'

export default function App() {
  return <UiProvider><AuthProvider><AppRouter /></AuthProvider></UiProvider>
}
