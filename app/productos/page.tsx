'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'; 
import ProductModal from '@/app/components/ProductModal'

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

  if (loading) return <div className="text-center p-5"><h3>Cargando productos...</h3></div>

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">🥕 Gestión de Productos ({filteredProducts.length})</h1>
          <p className="text-muted">El control central de tu inventario y precios.</p>
        </div>
        <button onClick={() => handleOpenModal(null)} className="btn btn-primary btn-lg">
          <i className="fas fa-plus me-2"></i>Añadir Producto
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Buscar producto..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        className="form-control form-control-lg mb-4"
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th className="text-center">Stock</th>
                  <th className="text-end">Costo</th>
                  <th className="text-end">Venta</th>
                  <th className="text-center">Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    {/* --- INICIO DE LA CORRECCIÓN --- */}
                    {/* Muestra el stock solo si es 'huevo', sino muestra un guion */}
                    <td className="text-center">
                      {product.type === 'huevo' ? product.stock_quantity : '-'}
                    </td>
                    {/* --- FIN DE LA CORRECCIÓN --- */}
                    <td className="text-end">${product.cost_price.toLocaleString('es-AR')}</td>
                    <td className="text-end">{product.sale_price ? `$${product.sale_price.toLocaleString('es-AR')}` : '-'}</td>
                    <td className="text-center">
                      <span className={`badge ${product.status === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button onClick={() => handleOpenModal(product)} className="btn btn-sm btn-outline-secondary">
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productToEdit={productToEdit}
        onProductSaved={handleProductSaved}
      />
    </div>
  )
}