import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
} 
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link';

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name: string;
  }[] | null;
};

type OrderDetails = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number | null;
  is_paid: boolean;
  users: {
    full_name: string;
    phone_number: string;
  }[] | null;
  order_items: OrderItem[];
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, status, total_amount, is_paid,
      users ( full_name, phone_number ),
      order_items ( id, quantity, unit_price, total_price, products ( name ) )
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    return (
      <div>
        <h1>Pedido no encontrado</h1>
        <p>No se pudo cargar el detalle del pedido.</p>
        <Link href="/pedidos">Volver a la lista de pedidos</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/pedidos">{"< Volver a Pedidos"}</Link>
      <header style={{ marginTop: '20px' }}>
        <h1>Detalle del Pedido #{order.id.substring(0, 8)}</h1>
        <p><strong>Cliente:</strong> {order.users?.[0]?.full_name || 'N/A'}</p>
        <p><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString('es-AR')}</p>
        <p><strong>Estado:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{order.status}</span></p>
      </header>

      <div style={{ marginTop: '30px' }}>
        <h3>Items del Pedido</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Producto</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Cantidad</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Precio Unitario</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items as OrderItem[]).map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>{item.products?.[0]?.name || 'Producto no encontrado'}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>${item.unit_price.toLocaleString('es-AR')}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>${item.total_price.toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '1.2em' }}>
        <p><strong>Pagado:</strong> {order.is_paid ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Total del Pedido: ${order.total_amount?.toLocaleString('es-AR')}</strong></p>
      </div>

      <div style={{ marginTop: '40px', border: '1px solid #ddd', padding: '20px' }}>
          <h3>Acciones</h3>
          <p>Próximamente: botones para cambiar el estado del pedido.</p>
      </div>
    </div>
  );
}