'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  // Corregimos la definición de 'users' para que coincida con la estructura real
  users: { 
    full_name: string;
  } | null;
  status: string;
}

// Nueva interfaz para los productos de tipo huevo
interface EggProduct {
  name: string;
  stock_quantity: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([])
  const [eggStock, setEggStock] = useState<EggProduct[]>([]) // Estado para el stock de huevos
  const router = useRouter()

  const fetchData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login');
        return;
      } 
      setUser(session.user);
      
      // Hacemos las dos llamadas a la vez para más eficiencia
      const [ordersResponse, eggStockResponse] = await Promise.all([
        supabase.from('orders').select('id, created_at, total_amount, status, users(full_name)').eq('status', 'confirmado').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('name, stock_quantity').eq('type', 'huevo').order('name')
      ]);

      if (ordersResponse.error) console.error('Error fetching new orders:', ordersResponse.error)
      else setOrders(ordersResponse.data as any); // Usamos 'any' para evitar conflictos de tipo temporales

      if (eggStockResponse.error) console.error('Error fetching egg stock:', eggStockResponse.error)
      else setEggStock(eggStockResponse.data as EggProduct[]);
      
      setLoading(false);
  }

  useEffect(() => {
    fetchData()
  }, [])
  
  const handleFacturarYConsolidar = async () => {
    if (!confirm('¿Seguro que quieres facturar TODOS los pedidos confirmados?')) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('facturar_pedidos_confirmados');
    if (error) {
      alert('Error al facturar: ' + error.message);
      setActionLoading(false);
    } else {
      alert(data);
      router.push('/consolidado');
    }
  };

  const handleArchivar = async () => {
    if (!confirm('¿Seguro que quieres archivar TODOS los pedidos facturados?')) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('archivar_pedidos_facturados');
    if (error) {
      alert('Error al archivar: ' + error.message);
    } else {
      alert(data);
      fetchData();
    }
    setActionLoading(false);
  };

  const handleVerDeudores = () => router.push('/deudores');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-warning text-dark';
      case 'facturado': return 'bg-primary';
      case 'pagado': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

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
        <button onClick={handleFacturarYConsolidar} className="btn btn-primary btn-lg me-2" disabled={actionLoading}>
            {actionLoading ? 'Procesando...' : <><i className="fas fa-file-invoice-dollar me-2"></i>Facturar y Consolidar</>}
        </button>
        <button onClick={handleArchivar} className="btn btn-secondary btn-lg me-2" disabled={actionLoading}>
            {actionLoading ? 'Procesando...' : <><i className="fas fa-archive me-2"></i>Archivar Pedidos</>}
        </button>
        <button onClick={handleVerDeudores} className="btn btn-warning btn-lg" disabled={actionLoading}>
            <i className="fas fa-hand-holding-usd me-2"></i>Ver Deudores
        </button>
      </div>
      
      <div className="row">
        {/* Tabla de Stock de Huevos */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">🥚 Stock de Huevos</h5></div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-end">Stock Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eggStock.length > 0 ? eggStock.map((egg) => (
                      <tr key={egg.name}>
                        <td>{egg.name}</td>
                        <td className="text-end">{egg.stock_quantity}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} className="text-center p-3">No se encontraron productos de tipo "Huevo".</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Últimos Pedidos (la movemos aquí para un mejor diseño) */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Últimos Pedidos Confirmados</h5></div>
            <div className="card-body">
               <div className="table-responsive">
                <table className="table table-sm table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th className="text-end">Total</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
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
                      <tr>
                        <td colSpan={3} className="text-center p-3">No hay pedidos nuevos por el momento.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}