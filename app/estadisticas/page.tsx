'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Interfaces actualizadas para los datos de la nueva función
interface BusinessReport {
  total_revenue: number;
  total_profit: number;
  total_orders: number;
  top_products_by_profit: { name: string; total_profit_generated: number }[];
  top_clients_by_profit: { full_name: string; total_profit_generated: number }[];
}

export default function EstadisticasPage() {
  const [data, setData] = useState<BusinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30); // Por defecto, últimos 30 días

  useEffect(() => {
    const fetchBusinessReport = async () => {
      setLoading(true);
      // Llamamos a la nueva y potente función RPC
      const { data: rpcData, error } = await supabase.rpc('get_business_report', { period_days: period });
      
      if (error) {
        console.error("Error fetching business report:", error);
        setData(null);
      } else {
        // La función devuelve un array con un solo objeto
        setData(rpcData[0]);
      }
      setLoading(false);
    };

    fetchBusinessReport();
  }, [period]);

  // --- Cálculos derivados ---
  const profitMargin = data && data.total_revenue > 0 
    ? (data.total_profit / data.total_revenue) * 100 
    : 0;

  const averagePerOrder = data && data.total_orders > 0 
    ? data.total_revenue / data.total_orders 
    : 0;

  if (loading) {
    return <div className="text-center p-5"><h3>Cargando informe de negocio...</h3></div>
  }

  if (!data) {
    return <div className="text-center p-5"><h3>No se pudieron cargar los datos del informe.</h3></div>
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h2">📊 Informe de Negocio</h1>
          <p className="text-muted">Análisis de rentabilidad de los últimos {period} días.</p>
        </div>
        {/* Puedes añadir un selector de período aquí en el futuro */}
      </div>
      <hr />

      {/* MÉTRICAS CLAVE */}
      <h3 className="h5 mb-3">Métricas Clave</h3>
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-4 mb-4">
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">📈 Ingresos Totales</h6>
              <p className="card-text fs-4 fw-bold">${(data.total_revenue || 0).toLocaleString('es-AR')}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">💰 Ganancia Bruta</h6>
              <p className="card-text fs-4 fw-bold">${(data.total_profit || 0).toLocaleString('es-AR')}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">🎯 Margen de Ganancia</h6>
              <p className="card-text fs-4 fw-bold">{profitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">🧾 Total de Pedidos</h6>
              <p className="card-text fs-4 fw-bold">{data.total_orders || 0}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="card-title text-muted">🛒 Promedio por Pedido</h6>
              <p className="card-text fs-4 fw-bold">${averagePerOrder.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RANKINGS POR GANANCIA */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">🏆 Top 5 Productos (por Ganancia)</h5></div>
            <ul className="list-group list-group-flush">
              {data.top_products_by_profit && data.top_products_by_profit.map((product, index) => (
                <li key={`${product.name}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                  {product.name}
                  <span className="badge bg-primary rounded-pill">${(product.total_profit_generated || 0).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">👑 Top 5 Clientes (por Ganancia)</h5></div>
            <ul className="list-group list-group-flush">
              {data.top_clients_by_profit && data.top_clients_by_profit.map((client, index) => (
                <li key={`${client.full_name}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                  {client.full_name}
                  <span className="badge bg-success rounded-pill">${(client.total_profit_generated || 0).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}