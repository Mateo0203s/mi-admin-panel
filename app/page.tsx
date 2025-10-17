'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// --- INTERFACES ---
interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  users: { 
    full_name: string;
  } | null;
  status: string;
}

interface EggProduct {
  name: string;
  stock_quantity: number;
}

// 1. NUEVA INTERFAZ PARA EL INFORME DETALLADO
interface EggReportItem {
  product_name: string;
  total_sold: number;
  top_buyers: {
    full_name: string;
    quantity_bought: number;
  }[];
}


export default function Home() {
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter()

  // 3. ACTUALIZAMOS LA CARGA DE DATOS
  const fetchData = useCallback(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login');
        return;
      } 
      setUser(session.user);
      
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('id, created_at, total_amount, status, users(full_name)')
    .eq('status', 'confirmado')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) console.error('Error fetching new orders:', ordersError);
  else setOrders(ordersData as any);

  }, [router])

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    }
    initialLoad();
  }, [fetchData])
  
  const handleFacturarTodos = async () => {
    if (!confirm('¿Seguro que quieres facturar TODOS los pedidos confirmados? Esta acción no se puede deshacer.')) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('facturar_pedidos_confirmados');
    if (error) { alert('Error al facturar: ' + error.message); } 
    else { alert(data); await fetchData(); }
    setActionLoading(false);
  };

  const handleVerConsolidado = () => { router.push('/consolidado'); };

  const handleArchivar = async () => {
    if (!confirm('¿Seguro que quieres archivar TODOS los pedidos facturados?')) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('archivar_pedidos_facturados');
    if (error) { alert('Error al archivar: ' + error.message); } 
    else { alert(data); await fetchData(); }
    setActionLoading(false);
  };

  const handleVerDeudores = () => router.push('/deudores');
  
  if (loading) {
    return <div className="text-center p-5"><h3>Cargando panel...</h3></div>
  }

  return (
    <div className="container mt-4">
      <h1 className="h2">👋 Panel de Acciones</h1>
      <p className="text-muted">Gestiona las operaciones diarias de tu negocio. Sesión: <strong>{user?.email}</strong></p>
      <hr />

      <div className="mb-4">
        <h3 className="h5">Acciones Rápidas</h3>
        <div className="btn-group" role="group">
          <button onClick={handleFacturarTodos} className="btn btn-primary btn-lg" disabled={actionLoading}>
            {actionLoading ? 'Procesando...' : <><i className="fas fa-file-invoice-dollar me-2"></i>Facturar TODOS</>}
          </button>
          <button onClick={handleVerConsolidado} className="btn btn-info btn-lg" disabled={actionLoading}>
            <i className="fas fa-shopping-cart me-2"></i>Ver Consolidado
          </button>
        </div>
        <button onClick={handleArchivar} className="btn btn-secondary btn-lg ms-3" disabled={actionLoading}>
            {actionLoading ? 'Procesando...' : <><i className="fas fa-archive me-2"></i>Archivar Pedidos</>}
        </button>
        <button onClick={handleVerDeudores} className="btn btn-warning btn-lg ms-2" disabled={actionLoading}>
            <i className="fas fa-hand-holding-usd me-2"></i>Ver Deudores
        </button>
      </div>
      
      <div className="row">
        <div className="col-lg-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Últimos Pedidos Confirmados</h5></div>
            <div className="card-body">
               <div className="table-responsive">
                <table className="table table-sm table-hover align-middle">
                  <thead><tr><th>Cliente</th><th className="text-end">Total</th><th className="text-end">Acciones</th></tr></thead>
                  <tbody>
                    {orders.length > 0 ? orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.users?.full_name || 'N/A'}</td>
                        <td className="text-end">${order.total_amount.toLocaleString('es-AR')}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => router.push(`/pedidos/${order.id}`)}>
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="text-center p-3">No hay pedidos nuevos por el momento.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. NUEVA SECCIÓN: INFORME DETALLADO DE HUEVOS --- */}
    </div>
  )
}