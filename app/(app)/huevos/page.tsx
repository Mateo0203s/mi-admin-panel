'use client'

import { useEffect, useState, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import ProductModal from '../../components/ProductModal'; // Importamos el modal

// --- INTERFACES ---
interface Product {
  id: string;
  name: string;
  type: 'verduleria' | 'huevo';
  stock_quantity: number;
  cost_price: number;
  sale_price: number | null;
  status: 'activo' | 'inactivo';
}

interface EggReportItem {
  product_name: string;
  total_sold: number;
  top_buyers: {
    full_name: string;
    quantity_bought: number;
  }[];
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
  const [stock, setStock] = useState<Product[]>([]); // CORREGIDO: Usa la interfaz Product
  const [orders, setOrders] = useState<EggOrderItem[]>([]);
  
  // Estados para el modal de edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
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
      // La consulta de stock ahora trae todos los datos necesarios para el formulario de edición
      supabase.from('products').select('id, name, stock_quantity, type, cost_price, sale_price, status').eq('type', 'huevo').order('name'),
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

  // --- MANEJADORES DE EVENTOS PARA EL MODAL ---
  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleProductSaved = () => {
    handleCloseModal();
    fetchData(); // Vuelve a cargar todos los datos para reflejar los cambios
  };

  if (loading) {
    return <div className="text-center p-5"><h3>Cargando Dashboard de Huevos...</h3></div>
  }

  return (
    <div className="container mt-4">
      <h1 className="h2">🥚 Dashboard de Huevos</h1>
      <p className="text-muted">Centro de control para la unidad de negocio de huevos.</p>
      <hr />

      {/* SECCIÓN 1: MÉTRICAS CLAVE (Sin cambios) */}
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
        {/* SECCIÓN 2: GESTIÓN DE STOCK Y PRECIOS (Interfaz simplificada) */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestión de Stock y Precios</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Stock Actual</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td className="text-center">{item.stock_quantity}</td>
                      <td className="text-end">
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleEditClick(item)}
                        >
                          <i className="fas fa-pencil-alt me-1"></i> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PEDIDOS RECIENTES CON HUEVOS (Sin cambios) */}
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

      {/* RENDERIZADO DEL MODAL */}
      {isModalOpen && (
        <ProductModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            productToEdit={productToEdit}
            onProductSaved={handleProductSaved}
        />
      )}
    </div>
  )
}