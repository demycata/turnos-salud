import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Salud Turnos',
  description: 'Sistema de gestion de turnos para centros de salud',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-surface-50">
        {children}
      </body>
    </html>
  )
}
