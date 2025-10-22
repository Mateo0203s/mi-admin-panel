'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ConsolidadoItem {
  producto: string;
  cantidad_total: number;
  costo_flete_total: number;
}
type FilterType = 'Todos' | 'Normal' | 'Con Flete';

export default function ConsolidadoPage() {
  const [items, setItems] = useState<ConsolidadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFreightCost, setTotalFreightCost] = useState(0);
  const [activeTab, setActiveTab] = useState<FilterType>('Todos');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bot-lahuerta.ngrok.app';

  useEffect(() => {
    const fetchConsolidado = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_consolidado', {
        p_filter_type: activeTab
      });
      
      if (error) {
        console.error("Error al cargar el consolidado:", error);
        setItems([]);
      } else {
        const typedData = data as ConsolidadoItem[];
        setItems(typedData);
        const totalFreight = typedData.reduce((sum, item) => sum + item.costo_flete_total, 0);
        setTotalFreightCost(totalFreight);
      }
      setLoading(false);
    };

    fetchConsolidado();
  }, [activeTab]);

  const handlePrint = () => window.print();

  // --- CORRECCIÓN AQUÍ ---
  // Ahora pasamos el filtro activo como un parámetro en la URL
  const handleExportPDF = () => {
    if (items.length === 0) {
      alert('No hay datos en la vista actual para exportar.');
      return;
    }
    window.open(`${backendUrl}/exportar_consolidado_pdf?filter=${activeTab}`, '_blank');
  };

  return (
    <div className="container mt-4">
      <h1 className="h2">🛒 Orden de Compra (Consolidado)</h1>
      <p className="text-muted">Lista de compras generada a partir de todos los pedidos facturados.</p>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'Todos' ? 'active' : ''}`} onClick={() => setActiveTab('Todos')}>
              Consolidado TOTAL
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'Normal' ? 'active' : ''}`} onClick={() => setActiveTab('Normal')}>
              Consolidado Normal
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'Con Flete' ? 'active' : ''}`} onClick={() => setActiveTab('Con Flete')}>
              Consolidado Flete
            </button>
          </li>
        </ul>
        <div>
          <button onClick={handleExportPDF} className="btn btn-success">
            <i className="fas fa-file-pdf me-2"></i>Exportar
          </button>
        </div>
      </div>

      <div className="card mt-3 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">
            {activeTab === 'Todos' && 'Consolidado Total de Pedidos Facturados'}
            {activeTab === 'Normal' && 'Consolidado para Clientes Normales'}
            {activeTab === 'Con Flete' && 'Consolidado para Clientes con Flete'}
          </h5>
          {loading ? (
            <div className="text-center p-5">Cargando reporte...</div>
          ) : (
            <>
              <table className="table table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th className='text-end'>Cantidad a Comprar</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map((item) => (
                    <tr key={item.producto}>
                      <td>{item.producto}</td>
                      <td className='text-end'>{item.cantidad_total}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} className="text-center p-4">No hay productos en esta categoría.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {activeTab === 'Con Flete' && totalFreightCost > 0 && (
                <div className="alert alert-info mt-4">
                  <h5 className="alert-heading">🚚 Costo Total de Flete</h5>
                  <p className="mb-0">
                    El costo total de flete para los pedidos de esta categoría es de 
                    <strong className="ms-2 fs-5">${totalFreightCost.toLocaleString('es-AR')}</strong>.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}