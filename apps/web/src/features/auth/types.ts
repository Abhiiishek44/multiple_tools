export type AuthenticatedUser = {
  id: string
  email: string
  name: string
  picture_url: string | null
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'
