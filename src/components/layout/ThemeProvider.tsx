'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { MobileAdBanner } from '@/components/shared/MobileAdBanner'
import styles from './ThemeProvider.module.css'

interface ThemeContextValue {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => {} })
export function useTheme() { return useContext(ThemeContext) }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('phototools-theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('phototools-theme', theme)
  }, [theme])

  return (
    <ThemeContext value={{ theme, setTheme }}>
      <Nav theme={theme} onThemeChange={setTheme} />
      <main className={styles.main}>{children}</main>
      <Footer />
      <MobileAdBanner />
      <Toaster theme={theme} position="bottom-center" />
    </ThemeContext>
  )
}
