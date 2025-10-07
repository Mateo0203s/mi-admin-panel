'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'; // Usamos también la ruta con @/
import ProductModal from '@/app/components/ProductModal' // <-- RUTA CORREGIDA

// ... (El resto del código de este archivo no cambia)
interface Product {
  id: string;
  name: string;
  type: 'verduleria' | 'huevo';
  stock_quantity: number;
  cost_price: number;
  sale_price: number | null;
  status: 'activo' | 'inactivo';
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (error) console.error('Error fetching products:', error)
    else setProducts(data as Product[])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOpenModal = (product: Product | null) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleProductSaved = () => {
    fetchProducts();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div>Cargando productos...</div>

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Gestión de Productos ({filteredProducts.length})</h1>
        <button onClick={() => handleOpenModal(null)} style={{ padding: '10px 15px', fontWeight: 'bold' }}>
          + Añadir Producto
        </button>
      </header>

      <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }}/>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid black' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Stock</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Costo</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Venta</th>
            <th style={{ textAlign: 'center', padding: '8px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{product.name}</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>{product.stock_quantity}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>${product.cost_price.toLocaleString('es-AR')}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{product.sale_price ? `$${product.sale_price.toLocaleString('es-AR')}` : '-'}</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                <button onClick={() => handleOpenModal(product)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productToEdit={productToEdit}
        onProductSaved={handleProductSaved}
      />
    </div>
  )
}