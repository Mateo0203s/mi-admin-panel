'use client'

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// --- DEFINICIONES DE TIPOS (INTERFACES) ---
interface Product {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: { id: string, name: string; }[] | null;
  product_id: string; 
}

interface OrderDetails {
  id: string;
  created_at: string;
  status: string;
  total_amount: number | null;
  is_paid: boolean;
  users: { full_name: string; phone_number: string; } | null;
  order_items: OrderItem[];
}

// --- COMPONENTE PRINCIPAL ---
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  // --- ESTADOS ---
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ADICIÓN 1: URL DEL BACKEND ---
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';

  // --- EFECTOS (CARGA DE DATOS) ---
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, created_at, status, total_amount, is_paid,
          users ( full_name, phone_number ),
          order_items ( id, product_id, quantity, unit_price, total_price, products ( id, name ) )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
      } else {
        setOrder(data as any); 
        setEditedItems(data.order_items || []);
      }
      setLoading(false);
    };

    const fetchAllProducts = async () => {
        const { data } = await supabase.from('products').select('id, name').order('name');
        if(data) setAllProducts(data);
    }

    fetchOrder();
    fetchAllProducts();
  }, [orderId]);

  // --- MANEJADORES DE EVENTOS ---
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setEditedItems(editedItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity < 0 ? 0 : newQuantity } : item
    ));
  };

  const handleRemoveItem = (itemId: string) => {
    setEditedItems(editedItems.filter(item => item.id !== itemId));
  };
  
  const handleAddItem = (product: Product) => {
    if (editedItems.some(item => item.product_id === product.id)) return;
    const newItem: OrderItem = {
        id: `temp-${product.id}`,
        product_id: product.id,
        products: [{ id: product.id, name: product.name }],
        quantity: 1,
        unit_price: 0,
        total_price: 0,
    };
    setEditedItems([...editedItems, newItem]);
    setSearchTerm('');
  };

  const handleSaveChanges = async () => {
    if (!order) return;
    setLoading(true);
    const itemsToSave = editedItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
    }));
    const { data, error } = await supabase.rpc('editar_pedido', {
        p_order_id: order.id,
        p_items: itemsToSave,
    });
    if (error) {
        setMessage('Error al guardar: ' + error.message);
    } else {
        setMessage(data);
        setIsEditing(false);
        window.location.reload();
    }
    setLoading(false);
  };
  
  // --- ADICIÓN 2: FUNCIÓN PARA IMPRIMIR ---
  const handlePrintInvoice = () => {
    window.open(`${backendUrl}/generar_boleta_pdf/${orderId}`, '_blank');
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  if (loading) return <div className="container mt-4">Cargando...</div>;
  if (!order) return <div className="container mt-4"><h1>Pedido no encontrado</h1></div>;

  const filteredProducts = searchTerm
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const getProductName = (item: OrderItem) => {
    if (Array.isArray(item.products)) {
        return item.products[0]?.name || 'Producto no encontrado';
    }
    // @ts-ignore
    return item.products?.name || 'Producto no encontrado';
  }

  return (
    <div className="container mt-4">
      <Link href="/pedidos">{"< Volver a Pedidos"}</Link>
      
      <header className="mt-4 d-flex justify-content-between align-items-center">
        <div>
            <h1>Detalle del Pedido #{order.id.substring(0, 8)}</h1>
            <p className="mb-0"><strong>Cliente:</strong> {(order.users as any)?.[0]?.full_name || (order.users as any)?.full_name || 'N/A'}</p>
            <p className="mb-0"><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString('es-AR')}</p>
            <p><strong>Estado:</strong> <span className="text-capitalize fw-bold">{order.status}</span></p>
        </div>
        {/* --- ADICIÓN 3: BOTONES EN EL HEADER --- */}
        {!isEditing && (
            <div>
                <button className="btn btn-outline-primary btn-lg" onClick={() => setIsEditing(true)}>
                    <i className="fas fa-pencil-alt me-2"></i>Editar Pedido
                </button>
                <button onClick={handlePrintInvoice} className="btn btn-info btn-lg ms-2">
                    <i className="fas fa-print me-2"></i>Imprimir Boleta
                </button>
            </div>
        )}
      </header>
      
      {isEditing ? (
        <div className="card shadow-sm mt-4 border-primary">
            <div className="card-header bg-primary text-white"><h3 className="h5 mb-0">Modo Edición</h3></div>
            <div className="card-body">
                <div className="mb-4">
                    <input type="text" className="form-control" placeholder="Buscar para añadir producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {searchTerm && (
                        <ul className="list-group mt-1 position-absolute w-100" style={{zIndex: 1000, maxWidth: '500px'}}>
                            {filteredProducts.slice(0, 5).map(p => (
                                <li key={p.id} className="list-group-item list-group-item-action" onClick={() => handleAddItem(p)}>
                                    {p.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <table className="table">
                    <tbody>
                        {editedItems.map((item) => (
                            <tr key={item.id}>
                                <td>{getProductName(item)}</td>
                                <td style={{ width: '120px' }}>
                                    <input type="number" className="form-control form-control-sm" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value))} />
                                </td>
                                <td className="text-end" style={{ width: '50px' }}>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <hr/>
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-secondary" onClick={() => { setIsEditing(false); setEditedItems(order.order_items); }}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSaveChanges}>Guardar Cambios</button>
                </div>
            </div>
        </div>
      ) : (
        <div className="card shadow-sm mt-4">
            <div className="card-header"><h3 className="h5 mb-0">Items del Pedido</h3></div>
            <div className="card-body">
                <table className="table">
                    <thead><tr><th>Producto</th><th className="text-center">Cantidad</th><th className="text-end">Precio Unitario</th><th className="text-end">Subtotal</th></tr></thead>
                    <tbody>
                        {order.order_items.map((item) => (
                            <tr key={item.id}>
                                <td>{getProductName(item)}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">${item.unit_price.toLocaleString('es-AR')}</td>
                                <td className="text-end">${item.total_price.toLocaleString('es-AR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      <div className="text-end mt-3 fs-5">
        <p><strong>Pagado:</strong> {order.is_paid ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Total del Pedido: ${order.total_amount?.toLocaleString('es-AR')}</strong></p>
      </div>

      {/* Eliminamos la sección de acciones de abajo para no duplicar botones */}
    </div>
  );
}