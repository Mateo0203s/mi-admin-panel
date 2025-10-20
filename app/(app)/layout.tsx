// app/(app)/layout.tsx

'use client'; // <-- Correcto, necesita ser un Componente de Cliente por el useState

import { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import AuthGuard from '@/app/components/AuthGuard';
import '@/app/globals.css'
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Toda tu lógica de estado para el sidebar va aquí
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthGuard>
      <div style={{ display: 'flex' }}>
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="flex-grow-1"> {/* Usamos flex-grow-1 para que ocupe el espacio restante */}
          {/* Barra de navegación superior con el botón de hamburguesa */}
          <nav className="navbar navbar-light bg-light shadow-sm">
            <div className="container-fluid">
              <button 
                className="btn btn-outline-secondary" 
                type="button" 
                onClick={toggleSidebar}
              >
                <i className="fas fa-bars"></i>
              </button>
              {/* Aquí puedes agregar más elementos como el perfil de usuario, etc. */}
            </div>
          </nav>

          {/* El contenido de cada página se renderiza aquí, con un poco de padding */}
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}