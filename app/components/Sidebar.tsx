'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Lista de enlaces de navegación
const navLinks = [
  { name: 'Dashboard', href: '/' },
  { name: 'Pedidos', href: '/pedidos' },
  { name: 'Productos', href: '/productos' },
  { name: 'Clientes', href: '/clientes' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div style={{ width: '250px', borderRight: '1px solid #ddd', padding: '20px', height: '100vh', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '30px' }}>Admin Panel</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.name} style={{ marginBottom: '10px' }}>
                <Link href={link.href} style={{ 
                  textDecoration: 'none', 
                  color: isActive ? 'blue' : 'black',
                  fontWeight: isActive ? 'bold' : 'normal',
                  display: 'block',
                  padding: '10px',
                  borderRadius: '5px',
                  backgroundColor: isActive ? '#e0e7ff' : 'transparent'
                }}>
                  {link.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}