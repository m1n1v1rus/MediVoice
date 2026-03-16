import { createContext, useContext, useState } from 'react'

const Ctx = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('mv_token'))
  const [clinic, setClinic] = useState(JSON.parse(localStorage.getItem('mv_clinic') || 'null'))

  const login = (t, c) => {
    localStorage.setItem('mv_token', t)
    localStorage.setItem('mv_clinic', JSON.stringify(c))
    setToken(t); setClinic(c)
  }

  const logout = () => {
    localStorage.removeItem('mv_token')
    localStorage.removeItem('mv_clinic')
    setToken(null); setClinic(null)
  }

  return <Ctx.Provider value={{ token, clinic, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)