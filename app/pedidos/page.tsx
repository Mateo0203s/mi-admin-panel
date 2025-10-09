'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  useEffect(() => {
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

  // Función para los badges de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-warning text-dark';
      case 'facturado': return 'bg-primary';
      case 'archivado': return 'bg-secondary';
      case 'cancelado': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  }

  return (
    // --- INICIO DE LA ACTUALIZACIÓN VISUAL ---
    <div className="container mt-4">
      <h1 className="h2">📦 Gestión de Pedidos</h1>
      <p className="text-muted">Visualiza y gestiona el estado de todos los pedidos.</p>
      
      <div className="btn-group mb-4" role="group">
        <button type="button" onClick={() => setFilter('confirmado')} className={`btn ${filter === 'confirmado' ? 'btn-primary' : 'btn-outline-primary'}`}>Confirmados</button>
        <button type="button" onClick={() => setFilter('facturado')} className={`btn ${filter === 'facturado' ? 'btn-primary' : 'btn-outline-primary'}`}>Facturados</button>
        <button type="button" onClick={() => setFilter('archivado')} className={`btn ${filter === 'archivado' ? 'btn-primary' : 'btn-outline-primary'}`}>Archivados</button>
        <button type="button" onClick={() => setFilter('todos')} className={`btn ${filter === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}>Todos</button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5">Cargando pedidos...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th className="text-center">Pagado</th>
                    <th className="text-end">Monto Total</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/pedidos/${order.id}`)}>
                      <td>{order.users?.full_name || 'N/A'}</td>
                      <td>{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                      <td>
                        <span className={`badge rounded-pill ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-center">{order.is_paid ? '✅' : '❌'}</td>
                      <td className="text-end">
                        {order.total_amount ? `$${order.total_amount.toLocaleString('es-AR')}` : '-'}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          { !loading && orders.length === 0 && <p className="text-center p-4">No se encontraron pedidos con el filtro actual.</p> }
        </div>
      </div>
    </div>
    // --- FIN DE LA ACTUALIZACIÓN VISUAL ---
  )
}