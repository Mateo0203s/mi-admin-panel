'use client'

import Select, { SingleValue } from 'react-select';
export const dynamic = 'force-dynamic';
// CORREGIDO: Añadimos useCallback
import { useState, useEffect, use, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { updateOrderAndRevalidate } from '../actions'
// --- INTERFACES (Sin cambios) ---
interface Product {
  id: string;
  name: string;
  type?: string;
  cost_price?: number;
}
interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: Product[] | null;
    product_id: string;
}
interface OrderDetails {
  id: string;
  created_at: string;
  status: string;
  total_amount: number | null;
  is_paid: boolean;
  users: { full_name: string; phone_number: string; client_type: string; }[] | null;
  order_items: OrderItem[];

}

// --- TIPO AÑADIDO PARA REACT-SELECT ---
type ProductOptionType = {
  value: string;
  label: string;
};
// --- COMPONENTE PRINCIPAL ---
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const searchParams = useSearchParams();
  const filtro = searchParams.get('filtro');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
// --- BLOQUE AÑADIDO: FORMATEAR PRODUCTOS PARA REACT-SELECT ---
const productOptions = useMemo(() => {
  return allProducts.map(product => ({
    value: product.id,
    label: product.name
  }));
}, [allProducts]);
// --- FIN DEL BLOQUE AÑADIDO ---
  // CORREGIDO: Envolvemos la función en useCallback para que tenga una identidad estable
  // y solo se vuelva a crear si 'orderId' cambia.
const fetchOrder = useCallback(async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users ( full_name, phone_number, client_type ),
          order_items ( *, products ( *, type, cost_price ) )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      } else if (data) {
          // --- INICIO DEL BLOQUE NORMALIZADOR (el que ya tenías) ---
          if (data.users && !Array.isArray(data.users)) {
              data.users = [data.users];
          }
          if (data.order_items) {
              for (const item of data.order_items) {
                  if (item.products && !Array.isArray(item.products)) {
                      item.products = [item.products];
                  }
              }
          }
          // --- FIN DEL BLOQUE NORMALIZADOR ---

          // =================================================================
          // === INICIO: LÓGICA DE RE-CÁLCULO DE PRECIOS PARA CLIENTES "CON FLETE" ===
          // =================================================================
          const clientType = data.users?.[0]?.client_type;
          
          if (clientType === 'Con Flete' && data.order_items) {
            for (const item of data.order_items) {
              const costPrice = item.products?.[0]?.cost_price;
              if (costPrice !== undefined) {
                // Forzamos el precio unitario y el total a ser el de costo
                item.unit_price = costPrice;
                item.total_price = costPrice * item.quantity;
              }
            }
          }
          // ======================== FIN DE LA LÓGICA DE RE-CÁLCULO ========================


          // =================================================================
          // === INICIO: LÓGICA DE ORDENAMIENTO ALFABÉTICO DE PRODUCTOS ===
          // =================================================================
          if (data.order_items) {
            data.order_items.sort((a: OrderItem, b: OrderItem) => { // <-- Now they have the correct type
              const nameA = a.products?.[0]?.name.toLowerCase() || '';
              const nameB = b.products?.[0]?.name.toLowerCase() || '';
              if (nameA < nameB) return -1;
              if (nameA > nameB) return 1;
              return 0;
            });
          }
          // ======================== FIN DE LA LÓGICA DE ORDENAMIENTO ========================

          // Finalmente, guardamos los datos ya corregidos y ordenados en el estado
          setOrder(data as OrderDetails);
          setEditedItems(data.order_items || []);
      }
  }, [orderId]);

  // CORREGIDO: El efecto ahora depende de 'fetchOrder'.
  // Se ejecutará solo cuando se cree una nueva función 'fetchOrder' (es decir, cuando 'orderId' cambie).
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchOrder();

      const { data: productsData } = await supabase.from('products').select('id, name').order('name');
      if (productsData) setAllProducts(productsData);

      setLoading(false);
    }
    fetchInitialData();
  }, [fetchOrder]);

  // Lógica de displayItems y displayTotal (sin cambios, ya era correcta)
  const displayItems = useMemo(() => {
    if (filtro === 'huevos') {
      return editedItems.filter(item => item.products?.[0]?.type === 'huevo');
    }
    return editedItems;
  }, [editedItems, filtro]);

const displayTotal = useMemo(() => {
    if (!order) return 0;

    // Obtenemos el tipo de cliente desde los datos del pedido
    const clientType = order.users?.[0]?.client_type;

    // SI el filtro está activo O SI el cliente es 'Con Flete',
    // SIEMPRE debemos recalcular el total sumando los items que se muestran en pantalla.
    if (filtro === 'huevos' || clientType === 'Con Flete') {
      return displayItems.reduce((acc, item) => acc + item.total_price, 0);
    }

    // Para el resto de los casos (clientes normales sin filtro), usamos el total de la base de datos.
    return order.total_amount ?? 0;
  }, [displayItems, filtro, order]);
  
  // --- MANEJADORES DE EVENTOS (sin cambios) ---
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
            products: [product],
            quantity: 1, unit_price: 0, total_price: 0,
        };
        setEditedItems([...editedItems, newItem]);
        setSearchTerm('');
    }

  const handleSaveChanges = async () => {
    if (!order) return;
    setActionLoading(true);

    const itemsToSave = editedItems.map(item => ({ 
      product_id: item.product_id, 
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    try {
      // En lugar de llamar a supabase.rpc, llamamos a nuestra Server Action
      const result = await updateOrderAndRevalidate(order.id, itemsToSave);

      alert(result); // Muestra el mensaje de éxito
      router.push('/pedidos'); // Redirige como antes

    } catch (error: any) {
      // Si la acción devuelve un error, lo atrapamos y lo mostramos
      alert('Error al guardar: ' + error.message);
      setActionLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!orderId) return;
    let url = `${backendUrl}/generar_boleta_pdf/${orderId}`;
    if (filtro === 'huevos') {
      url += '?filtro=huevos';
    }
    window.open(url, '_blank');
  };
  
  const handleMarkAsPaid = async () => {
    if (!order) return;
    if (!confirm('¿Seguro que quieres marcar este pedido como pagado?')) return;

    setActionLoading(true);
    const { data, error } = await supabase.rpc('marcar_pedido_como_pagado', { p_order_id: order.id });
    if (error) { alert('Error: ' + error.message); } 
    else { alert(data); await fetchOrder(); }
    setActionLoading(false);
  };
  
  const handleFacturarIndividual = async () => {
    if (!order) return;
    if (!confirm('¿Estás seguro de que quieres facturar este pedido?')) return;

    setActionLoading(true);
    const { data, error } = await supabase.rpc('facturar_pedido_individual', { p_order_id: order.id });
    if (error) { alert('Error: ' + error.message); }
    else { alert(data); await fetchOrder(); }
    setActionLoading(false);
  };
  
  // --- RENDERIZADO DEL COMPONENTE ---
  if (loading) return <div className="container mt-4">Cargando...</div>;
  if (!order) return <div className="container mt-4"><h1>Pedido no encontrado</h1><p>{message}</p></div>;

  const filteredProducts = searchTerm
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handlePriceChange = (itemId: string, newPrice: number) => {
    setEditedItems(editedItems.map(item =>
      item.id === itemId
        ? { 
            ...item, 
            unit_price: newPrice < 0 ? 0 : newPrice,
            // Recalculamos el precio total del item al cambiar el precio unitario
            total_price: (newPrice < 0 ? 0 : newPrice) * item.quantity 
          }
        : item
    ));
  };

const getProductName = (item: OrderItem) => {
    // Accedemos al primer elemento del array de productos
    return item.products?.[0]?.name || 'Producto no encontrado';
}

  return (
    <div className="container mt-4">
      <Link href={filtro === 'huevos' ? "/huevos" : "/pedidos"}>
        {filtro === 'huevos' ? "❮ Volver al Dashboard de Huevos" : "❮ Volver a Pedidos"}
      </Link>

      <header className="mt-4 d-flex justify-content-between align-items-center">
        <div>
          <h1>
            Detalle del Pedido #{order.id.substring(0, 8)}
            {filtro === 'huevos' && <span className="badge bg-warning text-dark ms-2">🥚 Solo Huevos</span>}
          </h1>
          <p className="mb-0">
            <strong>Cliente:</strong> {order.users?.[0]?.full_name || 'N/A'}
            {order.users?.[0]?.client_type === 'Con Flete' && (
              <span className="badge bg-info text-dark ms-2">🚛 Con Flete</span>
            )}
          </p>
          <p className="mb-0"><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString('es-AR')}</p>
          <p><strong>Estado:</strong> <span className="text-capitalize fw-bold">{order.status}</span></p>
        </div>

        {!isEditing && (
          <div className="d-flex gap-2">
            {/* El botón de Facturar solo aparece si está 'confirmado' (sin cambios) */}
            {order.status === 'confirmado' && (
              <button onClick={handleFacturarIndividual} className="btn btn-primary btn-lg" disabled={actionLoading}>
                {actionLoading ? 'Procesando...' : 'Facturar Pedido'}
              </button>
            )}

            {/* --- EL CAMBIO CLAVE --- */}
            {/* Ahora, el botón de Pagar aparece SIEMPRE que el pedido NO esté pagado */}
            {!order.is_paid && (
              <button onClick={handleMarkAsPaid} className="btn btn-success btn-lg" disabled={actionLoading}>
                {actionLoading ? 'Procesando...' : 'Marcar como Pago'}
              </button>
            )}

            <button className="btn btn-outline-secondary btn-lg" onClick={() => setIsEditing(true)}>Editar</button>
            <button onClick={handlePrintInvoice} className="btn btn-info btn-lg">Imprimir Boleta</button>
          </div>
        )}
      </header>
      
      {isEditing ? (
        // --- INICIO DEL BLOQUE DE EDICIÓN COMPLETO ---
        <div className="card shadow-sm mt-4 border-primary">
          <div className="card-header bg-primary text-white"><h3 className="h5 mb-0">Modo Edición</h3></div>
          <div className="card-body">
          <div className="mb-4">
            <Select<ProductOptionType> // <-- Le decimos al componente qué tipo de opciones usa
              options={productOptions}
              onChange={(selectedOption: SingleValue<ProductOptionType>) => { // <-- Tipamos el parámetro
                if (selectedOption) {
                  const productToAdd = allProducts.find(p => p.id === selectedOption.value);
                  if (productToAdd) {
                    handleAddItem(productToAdd);
                  }
                }
              }}
              placeholder="Buscar y añadir un producto..."
              noOptionsMessage={() => "No se encontraron productos"}
              isClearable
              value={null} 
            />
          </div>
            <table className="table">
              <tbody>
                {editedItems.map((item) => (
                  <tr key={item.id}>
                    {/* Nombre del producto (sin cambios) */}
                    <td>{getProductName(item)}</td>
                    
                    {/* NUEVO: Input para el Precio Unitario */}
                    <td style={{ width: '150px' }}>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          aria-label="Precio"
                          value={item.unit_price}
                          onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </td>

                    {/* Input para la Cantidad (sin cambios) */}
                    <td style={{ width: '120px' }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item.quantity}
                        step="0.5"
                        onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                      />
                    </td>

                    {/* Botón de eliminar (sin cambios) */}
                    <td className="text-end" style={{ width: '50px' }}>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
            <div className="d-flex justify-content-end gap-2">
              {/* CORREGIDO: Lógica del botón Cancelar para que recargue el estado inicial limpio */}
              <button className="btn btn-secondary" onClick={() => {
                  setIsEditing(false);
                  // Vuelve a establecer los items editados al estado original del pedido, asegurando la normalización.
                  const originalItems = (order?.order_items || []).map(item => {
                      let products = item.products;
                      if (products && !Array.isArray(products)) {
                          products = [products];
                      }
                      return { ...item, products };
                  });
                  setEditedItems(originalItems);
              }}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveChanges} disabled={actionLoading}>
                {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
        // --- FIN DEL BLOQUE DE EDICIÓN ---
      ) : (
        // --- INICIO DEL BLOQUE DE VISUALIZACIÓN (Este ya estaba bien) ---
        <div className="card shadow-sm mt-4">
          <div className="card-header"><h3 className="h5 mb-0">Items del Pedido</h3></div>
          <div className="card-body">
            <table className="table table-hover">
              <thead><tr><th>Producto</th><th className="text-center">Cantidad</th><th className="text-end">Precio Unitario</th><th className="text-end">Subtotal</th></tr></thead>
              <tbody>
                {displayItems.map((item) => (
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
        // --- FIN DEL BLOQUE DE VISUALIZACIÓN ---
      )}

      <div className="text-end mt-3 fs-5">
        <p><strong>Pagado:</strong> {order.is_paid ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Total Mostrado: ${displayTotal?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
      </div>
    </div>
  );
}