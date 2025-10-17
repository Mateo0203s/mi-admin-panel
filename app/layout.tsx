'use client' // <-- Convertimos el layout a un Componente de Cliente

import { useState } from 'react'; // <-- Importamos useState
import './globals.css'
import Sidebar from './components/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // --- LÓGICA NUEVA ---
  // Estado para controlar la visibilidad del sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Función para cambiar el estado
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  // --- FIN LÓGICA NUEVA ---

  return (
    <html lang="es">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <div style={{ display: 'flex' }}>
          {/* Le pasamos el estado actual al Sidebar */}
          <Sidebar isOpen={isSidebarOpen} />
          
          <main className="main-content">
            {/* --- BOTÓN DE HAMBURGUESA --- */}
            <nav className="navbar navbar-light bg-light mb-3">
              <div className="container-fluid">
                <button 
                  className="btn btn-outline-secondary" 
                  type="button" 
                  onClick={toggleSidebar}
                >
                  <i className="fas fa-bars"></i>
                </button>
                {/* Aquí puedes agregar más elementos a tu barra de navegación superior */}
              </div>
            </nav>
            {/* --- FIN BOTÓN --- */}
            
            {/* El contenido de la página se renderiza aquí */}
            {children}
          </main>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  )
}