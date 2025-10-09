'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Interfaz para los datos que recibiremos
interface Debtor {
  cliente: string;
  deuda: number;
}

export default function DeudoresPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDebt, setTotalDebt] = useState(0);

  useEffect(() => {
    const fetchDebtors = async () => {
      setLoading(true);
      // Llamamos a la función de la base de datos
      const { data, error } = await supabase.rpc('get_debtors_report');

      if (error) {
        console.error("Error al cargar deudores:", error);
      } else {
        const typedData = data as Debtor[];
        setDebtors(typedData);
        // Calculamos la deuda total
        const total = typedData.reduce((sum, debtor) => sum + debtor.deuda, 0);
        setTotalDebt(total);
      }
      setLoading(false);
    };

    fetchDebtors();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="h2">💰 Reporte de Deudores</h1>
      <p className="text-muted">Lista de clientes con pedidos facturados y pendientes de pago.</p>

      <div className="card mt-4 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center p-5">Cargando reporte...</div>
          ) : (
            <>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th className="text-end">Deuda Total</th>
                  </tr>
                </thead>
                <tbody>
                  {debtors.length > 0 ? debtors.map((debtor) => (
                    <tr key={debtor.cliente}>
                      <td>{debtor.cliente}</td>
                      <td className="text-end">${debtor.deuda.toLocaleString('es-AR')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} className="text-center p-4">¡Excelente! No hay deudas pendientes.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="table-light fw-bold fs-5">
                    <td className="text-end">Deuda Total General:</td>
                    <td className="text-end">${totalDebt.toLocaleString('es-AR')}</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}