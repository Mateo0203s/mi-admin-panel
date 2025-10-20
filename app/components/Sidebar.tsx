// app/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // <-- 1. IMPORTAMOS useRouter
import { supabase } from '@/lib/supabaseClient'          // <-- 2. IMPORTAMOS supabase

interface SidebarProps {
  isOpen: boolean;
}

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-tachometer-alt' },
  { name: 'Gestión de Huevos', href: '/huevos', icon: 'fas fa-egg' },
  { name: 'Pedidos', href: '/pedidos', icon: 'fas fa-box' },
  { name: 'Consolidado', href: '/consolidado', icon: 'fas fa-shopping-cart' },
  { name: 'Deudores', href: '/deudores', icon: 'fas fa-hand-holding-usd' },
  { name: 'Productos', href: '/productos', icon: 'fas fa-carrot' },
  { name: 'Clientes', href: '/clientes', icon: 'fas fa-users' },
  { name: 'Estadísticas', href: '/estadisticas', icon: 'fas fa-chart-line' },
]

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter() // <-- 3. OBTENEMOS LA INSTANCIA DEL ROUTER

  // --- 4. NUEVA FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Hubo un error al cerrar la sesión.');
    } else {
      // Redirigimos al usuario a la página de login
      router.push('/login');
    }
  };
  // --- FIN DE LA NUEVA FUNCIÓN ---

  return (
    <div 
      className={`sidebar d-flex flex-column p-3 text-white bg-dark ${isOpen ? '' : 'closed'}`}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      <h3 className="text-center mb-4">
        <i className="fas fa-leaf me-2"></i> <span>Admin La Huerta</span>
      </h3>
      <ul className="nav nav-pills flex-column mb-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <li key={link.name} className="nav-item">
              <Link href={link.href} className={`nav-link text-white ${isActive ? 'active' : ''}`}>
                <i className={`${link.icon} me-2`}></i>
                {isOpen && link.name}
              </Link>
            </li>
          )
        })}
      </ul>
      <hr />
      <div className="dropdown">
        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <i className="fas fa-user-circle fa-lg me-2"></i>
          <strong>Administrador</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
          <li><a className="dropdown-item" href="#">Configuración</a></li>
          <li><hr className="dropdown-divider" /></li>
          {/* --- 5. CAMBIO EN EL BOTÓN --- */}
          <li>
            <button onClick={handleLogout} className="dropdown-item">
              Cerrar Sesión
            </button>
          </li>
          {/* --- FIN DEL CAMBIO --- */}
        </ul>
      </div>
    </div>
  )
}