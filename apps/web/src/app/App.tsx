import { AppRouter } from './router'
import { AuthProvider } from './providers/AuthProvider'

export default function App() {
  return <AuthProvider><AppRouter /></AuthProvider>
}
