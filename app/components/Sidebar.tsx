'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Definimos la nueva prop que recibirá el componente
interface SidebarProps {
  isOpen: boolean;
}

const navLinks = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
  { name: 'Gestión de Huevos', href: '/huevos', icon: 'fas fa-egg' },
  { name: 'Pedidos', href: '/pedidos', icon: 'fas fa-box' },
  { name: 'Consolidado', href: '/consolidado', icon: 'fas fa-shopping-cart' },
  { name: 'Deudores', href: '/deudores', icon: 'fas fa-hand-holding-usd' },
  { name: 'Productos', href: '/productos', icon: 'fas fa-carrot' },
  { name: 'Clientes', href: '/clientes', icon: 'fas fa-users' },
  { name: 'Estadísticas', href: '/estadisticas', icon: 'fas fa-chart-line' },
]

// El componente ahora acepta la prop 'isOpen'
export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    // LA CLAVE: La clase cambia dinámicamente. Quitamos los estilos en línea.
    <div 
      className={`sidebar d-flex flex-column p-3 text-white bg-dark ${isOpen ? '' : 'closed'}`}
      style={{ height: '100vh', position: 'sticky', top: 0 }} // Usamos 'sticky' para que se quede fijo
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
                {/* Ocultamos el texto si el sidebar está cerrado para que no se vea feo */}
                {isOpen && link.name}
              </Link>
            </li>
          )
        })}
      </ul>
      {/* El resto del componente sigue igual... */}
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