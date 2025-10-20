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
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'activo' | 'inactivo'>('activo');
  

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
  
  const handleArchiveClick = (product: Product) => {
    setProductToArchive(product);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setProductToArchive(null);
    setShowConfirmModal(false);
  };

  const handleConfirmArchive = async () => {
    if (!productToArchive) return;
    updateProductStatus(productToArchive.id, 'inactivo', '¡Producto archivado con éxito!');
  };

  const handleReactivate = async (product: Product) => {
    updateProductStatus(product.id, 'activo', '¡Producto reactivado con éxito!');
  };

const handleSyncAllPrices = async () => {
    // Pedimos confirmación para una acción tan importante
    if (confirm('¿Estás seguro de que quieres sincronizar los precios de TODOS los productos en TODOS los pedidos activos (confirmados y facturados)? Esta acción no se puede deshacer.')) {
      setIsSyncing(true);
      const { data, error } = await supabase.rpc('sincronizar_precios_todos_los_productos');
      
      if (error) {
        alert('Error al sincronizar los precios: ' + error.message);
      } else {
        alert(data); // Muestra el mensaje de éxito de la función
      }
      setIsSyncing(false);
    }
  };


  const updateProductStatus = async (productId: string, newStatus: 'activo' | 'inactivo', successMessage: string) => {
    const { data, error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setProducts(products.map(p => p.id === productId ? data : p));
      alert(successMessage);
    }
    handleCloseConfirmModal();
  };

  const filteredProducts = products.filter(p => 
    p.status === activeTab && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-5"><h3>Cargando productos...</h3></div>

return (
    <div className="container mt-4">
      {/* --- ESTA ES LA SECCIÓN DEL ENCABEZADO QUE FUE MODIFICADA --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">🥕 Gestión de Productos</h1>
          <p className="text-muted">El control central de tu inventario y precios.</p>
        </div>
        {/* Envolvemos los botones en un div para alinearlos correctamente */}
        <div className="d-flex gap-2">
          {/* --- BOTÓN NUEVO DE SINCRONIZACIÓN --- */}
          <button 
            onClick={handleSyncAllPrices} 
            className="btn btn-warning btn-lg"
            disabled={isSyncing}
            title="Actualiza los precios en todos los pedidos activos (confirmados y facturados) con los valores actuales de esta lista."
          >
            {isSyncing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sincronizando...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt me-2"></i>
                Sincronizar Precios
              </>
            )}
          </button>
          
          {/* --- Tu botón existente de Añadir Producto --- */}
          <button onClick={() => handleOpenModal(null)} className="btn btn-primary btn-lg">
            <i className="fas fa-plus me-2"></i>Añadir Producto
          </button>
        </div>
      </div>
      
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'activo' ? 'active' : ''}`}
            onClick={() => setActiveTab('activo')}
          >
            Activos
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'inactivo' ? 'active' : ''}`}
            onClick={() => setActiveTab('inactivo')}
          >
            Inactivos
          </button>
        </li>
      </ul>

      <input 
        type="text" 
        placeholder={`Buscar en productos ${activeTab}s...`}
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
                    <td className="text-center">
                      {product.type === 'huevo' ? product.stock_quantity : '-'}
                    </td>
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

                      {activeTab === 'activo' ? (
                        <button 
                          onClick={() => handleArchiveClick(product)} 
                          className="btn btn-sm btn-outline-danger ms-2"
                          title="Archivar Producto"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReactivate(product)} 
                          className="btn btn-sm btn-outline-success ms-2"
                          title="Reactivar Producto"
                        >
                          <i className="fas fa-undo"></i>
                        </button>
                      )}
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

      {showConfirmModal && (
        <div className="modal" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Archivar</h5>
                <button type="button" className="btn-close" onClick={handleCloseConfirmModal}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres archivar el producto **"{productToArchive?.name}"**?</p>
                <p className="text-warning">El producto desaparecerá de la lista de activos y no podrá ser agregado a nuevos pedidos.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseConfirmModal}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-warning" onClick={handleConfirmArchive}>
                  Sí, Archivar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}