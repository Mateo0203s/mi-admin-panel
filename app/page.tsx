'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// CORRECCIÓN 1: Ajustamos la interfaz para que 'users' sea un array de objetos,
// que es como Supabase devuelve las relaciones por defecto.
interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  users: { full_name: string }[] | null;
}
interface KpiData {
  new_orders_count: number;
  monthly_revenue: number;
  low_stock_products_count: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        
        const [kpiResponse, ordersResponse] = await Promise.all([
          supabase.rpc('get_dashboard_kpis').single(),
          supabase.from('orders').select('id, created_at, total_amount, users(full_name)').eq('status', 'confirmado').order('created_at', { ascending: false })
        ]);

        if (kpiResponse.error) console.error('Error fetching KPIs:', kpiResponse.error)
        // CORRECCIÓN 2: Le decimos a TypeScript que confíe en que los datos tienen la forma de KpiData.
        else setKpis(kpiResponse.data as KpiData)

        if (ordersResponse.error) console.error('Error fetching new orders:', ordersResponse.error)
        else setOrders(ordersResponse.data as Order[])

        setLoading(false)
      }
    }
    checkUserAndFetchData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando...</div>
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <p>Sesión: <strong>{user?.email}</strong></p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Pedidos Nuevos</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{kpis?.new_orders_count || 0}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Ingresos del Mes</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>${(kpis?.monthly_revenue || 0).toLocaleString('es-AR')}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Productos Bajo Stock</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{kpis?.low_stock_products_count || 0}</p>
        </div>
      </div>

      <main>
        <h2>Pedidos Pendientes (Confirmados)</h2>
        {orders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid black' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Fecha</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                  {/* CORRECCIÓN 3: Accedemos al nombre del cliente a través del primer elemento del array 'users'. */}
                  <td style={{ padding: '8px' }}>{order.users?.[0]?.full_name || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>${order.total_amount.toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay pedidos nuevos por el momento. ¡Buen trabajo!</p>
        )}
      </main>
    </div>
  )
}
