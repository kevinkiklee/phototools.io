import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
