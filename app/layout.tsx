import './globals.css'
import Sidebar from './components/Sidebar'
// Importamos Head para añadir los links de CSS y JS
import Head from 'next/head'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Links a Bootstrap CSS y Font Awesome */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          {/* Añadimos la clase 'main-content' del preview */}
          <main className="main-content" style={{ flex: 1, padding: '20px' }}>
            {children}
          </main>
        </div>
        {/* Script de Bootstrap, necesario para componentes interactivos como dropdowns */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  )
}