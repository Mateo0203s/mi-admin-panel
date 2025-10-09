'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ConsolidatedItem {
  producto_nombre: string;
  cantidad_total: number;
  costo_estimado: number;
}
// Definimos los tipos de pestañas que tendremos
type TabType = 'Total' | 'Normal' | 'CostoConFlete';

export default function ConsolidadoPage() {
  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('Total'); // Estado para la pestaña activa

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';

  useEffect(() => {
    const fetchConsolidado = async () => {
      setLoading(true);
      
      // --- INICIO DE LA CORRECCIÓN ---
      // Mapeamos el nombre de la pestaña al parámetro que espera la función RPC
      const rpcParams = activeTab === 'Total' ? {} : { p_client_type: activeTab };
      
      const { data, error } = await supabase.rpc('get_consolidado_facturado', rpcParams);
      // --- FIN DE LA CORRECCIÓN ---
      
      if (error) {
        console.error("Error al cargar el consolidado:", error);
      } else {
        const typedData = data as ConsolidatedItem[];
        setItems(typedData);
        const total = typedData.reduce((sum, item) => sum + item.costo_estimado, 0);
        setTotalCost(total);
      }
      setLoading(false);
    };

    fetchConsolidado();
  }, [activeTab]); // <- El efecto se ejecuta cada vez que cambiamos de pestaña

  const handlePrint = () => window.print();
  const handleExportPDF = () => window.open(`${backendUrl}/exportar_consolidado_pdf`, '_blank');

  return (
    <div className="container mt-4">
      <h1 className="h2">🛒 Orden de Compra (Consolidado)</h1>
      <p className="text-muted">Lista de compras generada a partir de todos los pedidos facturados.</p>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Pestañas de Navegación */}
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'Total' ? 'active' : ''}`} onClick={() => setActiveTab('Total')}>
              Consolidado TOTAL
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'Normal' ? 'active' : ''}`} onClick={() => setActiveTab('Normal')}>
              Consolidado Normal
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'CostoConFlete' ? 'active' : ''}`} onClick={() => setActiveTab('CostoConFlete')}>
              Consolidado Flete
            </button>
          </li>
        </ul>
        {/* Botones de Acción */}
        <div>
          <button onClick={handleExportPDF} className="btn btn-success">
              <i className="fas fa-file-pdf me-2"></i>Exportar
          </button>
          <button onClick={handlePrint} className="btn btn-secondary ms-2">
              <i className="fas fa-print me-2"></i>Imprimir
          </button>
        </div>
      </div>

      <div className="card mt-3 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">
            {activeTab === 'Total' && 'Consolidado Total de Pedidos Facturados'}
            {activeTab === 'Normal' && 'Consolidado para Clientes Normales'}
            {activeTab === 'CostoConFlete' && 'Consolidado para Clientes con Flete'}
          </h5>
            {loading ? (
              <div className="text-center p-5">Cargando reporte...</div>
            ) : (
              <table className="table table-striped">
                {/* ... (El resto de la tabla es igual) ... */}
                <thead>
                  <tr>
                      <th>Producto</th>
                      <th className='text-end'>Cantidad a Comprar</th>
                      <th className='text-end'>Costo Estimado</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map((item) => (
                    <tr key={item.producto_nombre}>
                      <td>{item.producto_nombre}</td>
                      <td className='text-end'>{item.cantidad_total}</td>
                      <td className='text-end'>${item.costo_estimado.toLocaleString('es-AR')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="text-center p-4">No hay productos en esta categoría.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="table-light fw-bold">
                      <td colSpan={2} className="text-end">Total Estimado:</td>
                      <td className="text-end">${totalCost.toLocaleString('es-AR')}</td>
                  </tr>
                </tfoot>
              </table>
            )}
        </div>
      </div>
    </div>
  )
}