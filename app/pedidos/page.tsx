'use client'

import { useEffect, useState, useCallback } from 'react' // Añadimos useCallback
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // Importamos Link para el botón de detalle
import ManualOrderModal from '@/app/components/ManualOrderModal' // Importamos el modal de carga manual

// La interfaz ahora coincide con tu nueva estructura
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

  // --- NUEVOS ESTADOS PARA LOS MODALES ---
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Movemos fetchOrders fuera de useEffect para poder reutilizarla
  const fetchOrders = useCallback(async () => {
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
  }, [filter]); // Se vuelve a crear si el filtro cambia

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // --- NUEVAS FUNCIONES PARA LOS MODALES ---
  const handleOrderCreated = () => {
    fetchOrders(); // Refresca la lista después de crear un pedido
  };

  const handleDeleteClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation(); // MUY IMPORTANTE: Evita que se active el click de la fila
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOrderToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;

    const { data, error } = await supabase.rpc('delete_order_cascade', {
      p_order_id: orderToDelete.id
    });

    if (error) {
      alert('Error al eliminar el pedido: ' + error.message);
    } else {
      alert(data);
      setOrders(orders.filter(o => o.id !== orderToDelete.id));
    }
    handleCloseDeleteModal();
  };


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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 className="h2">📦 Gestión de Pedidos</h1>
            <p className="text-muted">Visualiza y gestiona el estado de todos los pedidos.</p>
        </div>
        {/* --- BOTÓN PARA CARGA MANUAL --- */}
        <button className="btn btn-primary btn-lg" onClick={() => setIsManualOrderModalOpen(true)}>
            <i className="fas fa-plus me-2"></i>Cargar Pedido Manual
        </button>
      </div>
      
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
                        <Link href={`/pedidos/${order.id}`} className="btn btn-sm btn-outline-primary" onClick={(e) => e.stopPropagation()}>
                           <i className="fas fa-eye"></i>
                        </Link>
                        {/* --- BOTÓN DE ELIMINAR --- */}
                        <button 
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={(e) => handleDeleteClick(e, order)}
                            title="Eliminar Pedido"
                        >
                            <i className="fas fa-trash"></i>
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

      {/* --- INTEGRACIÓN DE LOS MODALES --- */}
      <ManualOrderModal
        isOpen={isManualOrderModalOpen}
        onClose={() => setIsManualOrderModalOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      {showDeleteModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={handleCloseDeleteModal}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar el pedido de **{orderToDelete?.users?.full_name}**?</p>
                <p className="text-danger fw-bold">Esta acción es permanente y no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Sí, Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}