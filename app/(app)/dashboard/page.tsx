'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabaseClient'
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

interface ActiveProduct {
  name: string;
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter()
  const [activeProducts, setActiveProducts] = useState<ActiveProduct[]>([]);
  const [copyButtonText, setCopyButtonText] = useState('Copiar Lista');
  // 3. ACTUALIZAMOS LA CARGA DE DATOS
  const fetchData = useCallback(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login');
        return;
      } 
      setUser(session.user);
      
      // Ahora hacemos ambas consultas al mismo tiempo
      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, created_at, total_amount, status, users(full_name)')
          .eq('status', 'confirmado')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('products')
          .select('name')
          .eq('status', 'activo')
          .order('name')
      ]);

      if (ordersRes.error) console.error('Error fetching new orders:', ordersRes.error);
      else setOrders(ordersRes.data as any);

      if (productsRes.error) console.error('Error fetching active products:', productsRes.error);
      else setActiveProducts(productsRes.data || []);

    }, [router])

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    }
    initialLoad();
  }, [fetchData])
  
  const handleCopyProductList = () => {
      const productListString = activeProducts.map(p => p.name).join('\n');

      // Intenta usar la API moderna primero (funciona en HTTPS y localhost)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(productListString).then(() => {
          setCopyButtonText('¡Copiado!');
          setTimeout(() => setCopyButtonText('Copiar Lista'), 2000);
        }).catch(err => {
          console.error('Error al copiar con la API moderna: ', err);
          alert('No se pudo copiar la lista.');
        });
      } else {
        // Fallback para entornos no seguros (como HTTP en red local)
        const textArea = document.createElement('textarea');
        textArea.value = productListString;
        
        // Asegura que el textarea no sea visible
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopyButtonText('¡Copiado!');
          setTimeout(() => setCopyButtonText('Copiar Lista'), 2000);
        } catch (err) {
          console.error('Error al copiar con el método de fallback: ', err);
          alert('No se pudo copiar la lista.');
        }
        
        document.body.removeChild(textArea);
      }
    };
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
        {/* Columna para los pedidos recientes (ocupa 8 de 12 columnas) */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm h-100">
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

        {/* Columna para la lista de productos (ocupa 4 de 12 columnas) */}
        <div className="col-lg-4 mb-4">
            <div className="card shadow-sm h-100">
                <div className="card-header"><h5 className="mb-0">Lista de Productos Activos</h5></div>
                <div className="card-body d-flex flex-column">
                    <textarea
                        className="form-control flex-grow-1"
                        readOnly
                        value={activeProducts.map(p => p.name).join('\n')}
                        aria-label="Lista de productos activos"
                    />
                    <button
                        className="btn btn-success mt-2 w-100"
                        onClick={handleCopyProductList}
                    >
                        <i className="fas fa-copy me-2"></i>{copyButtonText}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}