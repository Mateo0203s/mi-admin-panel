import './globals.css' // Asumimos que este archivo existe para estilos globales
import Sidebar from './components/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div style={{ display: 'flex' }}>
          {/* El Sidebar es fijo y siempre visible */}
          <Sidebar />
          {/* 'children' es el contenido de la página actual (ej. Dashboard, Pedidos, etc.) */}
          <main style={{ flex: 1, padding: '20px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}