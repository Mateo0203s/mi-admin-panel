'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// --- INTERFACES ---
interface EggReportItem {
  product_name: string;
  total_sold: number;
  top_buyers: {
    full_name: string;
    quantity_bought: number;
  }[];
}

interface EggStockItem {
  id: string;
  name: string;
  stock_quantity: number;
}

interface EggOrderItem {
  id: string; // Order ID
  created_at: string;
  total_eggs_value: number;
  users: {
    full_name: string;
  }
}

// --- COMPONENTE PRINCIPAL ---
export default function HuevosDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<EggReportItem[]>([]);
  const [stock, setStock] = useState<EggStockItem[]>([]);
  const [orders, setOrders] = useState<EggOrderItem[]>([]);
  const [stockUpdates, setStockUpdates] = useState<{ [key: string]: number }>({});
  
  const router = useRouter();

  // --- CARGA DE DATOS ---
  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);

    const [reportRes, stockRes, ordersRes] = await Promise.all([
      supabase.rpc('get_egg_report', { period_days: 30 }),
      supabase.from('products').select('id, name, stock_quantity').eq('type', 'huevo').order('name'),
      supabase.rpc('get_orders_with_eggs')
    ]);

    if (reportRes.error) console.error("Error fetching egg report:", reportRes.error);
    else setReport(reportRes.data || []);

    if (stockRes.error) console.error("Error fetching egg stock:", stockRes.error);
    else setStock(stockRes.data || []);

    if (ordersRes.error) console.error("Error fetching egg orders:", ordersRes.error);
    else setOrders(ordersRes.data || []);
    
  }, [router]);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    }
    initialLoad();
  }, [fetchData]);

  // --- MANEJADORES DE EVENTOS ---
  const handleStockChange = (productId: string, value: string) => {
    const quantity = parseInt(value, 10);
    setStockUpdates(prev => ({ ...prev, [productId]: isNaN(quantity) ? 0 : quantity }));
  };

  const handleUpdateStock = async (productId: string) => {
    const newStock = stockUpdates[productId];
    if (newStock === undefined) return;

    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (error) {
      alert("Error al actualizar el stock: " + error.message);
    } else {
      alert("Stock actualizado correctamente.");
      // Refrescamos solo la lista de stock para ver el cambio
      const { data } = await supabase.from('products').select('id, name, stock_quantity').eq('type', 'huevo').order('name');
      if(data) setStock(data);
    }
  };

  if (loading) {
    return <div className="text-center p-5"><h3>Cargando Dashboard de Huevos...</h3></div>
  }

  return (
    <div className="container mt-4">
      <h1 className="h2">🥚 Dashboard de Huevos</h1>
      <p className="text-muted">Centro de control para la unidad de negocio de huevos.</p>
      <hr />

      {/* SECCIÓN 1: MÉTRICAS CLAVE */}
      <h3 className="h4">Informe de Ventas (Últimos 30 días)</h3>
      <div className="row mt-3">
        {report.length > 0 ? report.map(egg => (
          <div key={egg.product_name} className="col-lg-4 col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light"><h5 className="mb-0">{egg.product_name}</h5></div>
              <div className="card-body">
                <h6 className="card-title text-muted">Total Vendido</h6>
                <p className="card-text fs-4 fw-bold">{egg.total_sold.toLocaleString('es-AR')} unidades</p>
                <hr />
                <h6 className="card-title text-muted">Principales Compradores</h6>
                {egg.top_buyers.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {egg.top_buyers.map(buyer => (
                      <li key={buyer.full_name} className="list-group-item d-flex justify-content-between align-items-center px-0">
                        {buyer.full_name}
                        <span className="badge bg-primary rounded-pill">{buyer.quantity_bought}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted small">Sin datos de compradores.</p>}
              </div>
            </div>
          </div>
        )) : <p className="text-muted">No hay datos de ventas de huevos en el período seleccionado.</p>}
      </div>
      
      <hr className="my-4"/>

      <div className="row">
        {/* SECCIÓN 2: GESTIÓN DE STOCK */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Gestión de Stock</h5></div>
            <div className="card-body">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style={{width: '100px'}}>Stock Actual</th>
                    <th style={{width: '150px'}}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          defaultValue={item.stock_quantity}
                          onChange={(e) => handleStockChange(item.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => handleUpdateStock(item.id)}
                        >
                          <i className="fas fa-save me-1"></i> Guardar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PEDIDOS RECIENTES CON HUEVOS */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Pedidos Recientes con Huevos</h5></div>
            <div className="card-body">
              <table className="table table-sm table-hover align-middle">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th className="text-end">Total (Huevos)</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.users?.full_name || 'N/A'}</td>
                      <td className="text-end">${order.total_eggs_value.toLocaleString('es-AR')}</td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => router.push(`/pedidos/${order.id}?filtro=huevos`)}
                          title="Ver solo huevos en este pedido"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="text-center p-3">No hay pedidos recientes con huevos.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}