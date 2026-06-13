import { createContext, useState } from 'react'

export const UserContext = createContext()

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null)

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserContext.Provider>
  )
}
