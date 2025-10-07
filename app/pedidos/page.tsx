'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation' // <-- 1. IMPORTAMOS useRouter

// ... (la interfaz 'Order' y el tipo 'StatusFilter' no cambian)
interface Order {
  id: string;
  created_at: string;
  status: 'confirmado' | 'facturado' | 'archivado' | 'cancelado' | 'en_carrito';
  total_amount: number | null;
  is_paid: boolean;
  users: { full_name: string } | null;
}
type StatusFilter = 'confirmado' | 'facturado' | 'archivado' | 'todos';


export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('confirmado')
  const router = useRouter() // <-- 2. INICIALIZAMOS el router

  useEffect(() => {
    // ... (la función fetchOrders no cambia)
    const fetchOrders = async () => {
      setLoading(true)
      let query = supabase.from('orders').select('*, users(full_name)').order('created_at', { ascending: false })
      if (filter !== 'todos') {
        query = query.eq('status', filter)
      }
      const { data, error } = await query
      if (error) {
        console.error('Error fetching orders:', error)
      } else {
        setOrders(data as Order[])
      }
      setLoading(false)
    }
    fetchOrders()
  }, [filter])

  return (
    <div>
      {/* ... (el header y los botones de filtro no cambian) */}
      <header style={{ marginBottom: '30px' }}>
        <h1>Gestión de Pedidos</h1>
        <p>Visualiza y gestiona el estado de todos los pedidos.</p>
      </header>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setFilter('confirmado')} disabled={filter === 'confirmado'}>Confirmados</button>
        <button onClick={() => setFilter('facturado')} disabled={filter === 'facturado'}>Facturados</button>
        <button onClick={() => setFilter('archivado')} disabled={filter === 'archivado'}>Archivados</button>
        <button onClick={() => setFilter('todos')} disabled={filter === 'todos'}>Todos</button>
      </div>

      {loading ? (
        <p>Cargando pedidos...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {/* ... (el thead no cambia) */}
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Cliente</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Fecha</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Estado</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Pagado</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Monto Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              // --- INICIO DE LOS CAMBIOS ---
              <tr 
                key={order.id} 
                style={{ borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => router.push(`/pedidos/${order.id}`)} // <-- 3. AÑADIMOS EL EVENTO onClick
              >
              {/* --- FIN DE LOS CAMBIOS --- */}
                <td style={{ padding: '8px' }}>{order.users?.full_name || 'N/A'}</td>
                <td style={{ padding: '8px' }}>{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                <td style={{ padding: '8px', textTransform: 'capitalize' }}>{order.status}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>{order.is_paid ? '✅' : '❌'}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>
                  {order.total_amount ? `$${order.total_amount.toLocaleString('es-AR')}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      { !loading && orders.length === 0 && <p>No se encontraron pedidos con el filtro actual.</p> }
    </div>
  )
}