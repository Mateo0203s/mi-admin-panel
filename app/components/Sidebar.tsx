'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Añadimos los íconos del preview a nuestros enlaces
const navLinks = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
  { name: 'Pedidos', href: '/pedidos', icon: 'fas fa-box' },
  { name: 'Consolidado', href: '/consolidado', icon: 'fas fa-shopping-cart' },
  { name: 'Deudores', href: '/deudores', icon: 'fas fa-hand-holding-usd' }, // <--- AÑADIR ESTA LÍNEA
  { name: 'Productos', href: '/productos', icon: 'fas fa-carrot' },
  { name: 'Clientes', href: '/clientes', icon: 'fas fa-users' },
]

export default function Sidebar() {
  const pathname = usePathname()

  // Usamos las clases de Bootstrap y la estructura del preview
  return (
        <div 
      className="sidebar d-flex flex-column p-3 text-white bg-dark" 
      style={{ width: '250px', height: '100vh', position: 'fixed' }}
    >
      <h3 className="text-center mb-4">
        <i className="fas fa-leaf me-2"></i> Admin La Huerta
      </h3>
      <ul className="nav nav-pills flex-column mb-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <li key={link.name} className="nav-item">
              <Link href={link.href} className={`nav-link text-white ${isActive ? 'active' : ''}`}>
                <i className={`${link.icon} me-2`}></i>
                {link.name}
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
          <li><a className="dropdown-item" href="#">Cerrar Sesión</a></li>
        </ul>
      </div>
    </div>
  )
}
