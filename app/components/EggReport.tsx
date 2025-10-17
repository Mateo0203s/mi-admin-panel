// app/components/EggReport.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Definimos la estructura de los datos que esperamos de la función
interface EggReportData {
  total_eggs_sold: number;
  egg_revenue: number;
  egg_profit: number;
  top_egg_clients: {
    full_name: string;
    total_quantity_bought: number;
  }[];
}

export default function EggReport({ periodDays = 30 }) {
  const [report, setReport] = useState<EggReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_egg_report', {
        period_days: periodDays
      });

      if (error) {
        console.error("Error fetching egg report:", error);
      } else {
        // La función devuelve un array con un solo objeto de resultados
        setReport(data[0]);
      }
      setLoading(false);
    };
    fetchReport();
  }, [periodDays]);

  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <span className="spinner-border spinner-border-sm" role="status"></span>
          <span className="ms-2">Cargando informe de huevos...</span>
        </div>
      </div>
    );
  }

  if (!report) return null; // No mostrar nada si hay un error

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h4 className="h5 mb-0">🥚 Informe de Huevos (Últimos {periodDays} días)</h4>
      </div>
      <div className="card-body">
        <div className="row text-center mb-3">
          <div className="col-md-4">
            <h5>{report.total_eggs_sold.toLocaleString('es-AR')}</h5>
            <span className="text-muted">Huevos Vendidos</span>
          </div>
          <div className="col-md-4">
            <h5>${report.egg_revenue.toLocaleString('es-AR')}</h5>
            <span className="text-muted">Ingresos por Huevos</span>
          </div>
          <div className="col-md-4">
            <h5>${report.egg_profit.toLocaleString('es-AR')}</h5>
            <span className="text-muted">Ganancia por Huevos</span>
          </div>
        </div>
        <hr/>
        <h6>🏆 Top 5 Clientes de Huevos (por cantidad)</h6>
        <ul className="list-group list-group-flush">
          {report.top_egg_clients.map((client, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              {client.full_name}
              <span className="badge bg-primary rounded-pill">
                {client.total_quantity_bought} unidades
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}