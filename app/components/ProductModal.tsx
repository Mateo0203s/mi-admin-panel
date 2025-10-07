'use client'

import { supabase } from '@/lib/supabaseClient'; // <-- RUTA CORREGIDA
import ProductForm from './ProductForm';

// ... (El resto del código de este archivo no cambia)
// Definimos los tipos de datos que necesitamos
interface Product {
  id?: string;
  name: string;
  type: 'verduleria' | 'huevo';
  stock_quantity: number;
  cost_price: number;
  sale_price: number | null;
  status: 'activo' | 'inactivo';
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onProductSaved: () => void; // Función para refrescar la lista de productos
}

export default function ProductModal({ isOpen, onClose, productToEdit, onProductSaved }: ProductModalProps) {
  if (!isOpen) return null;

  const handleSave = async (productData: Product) => {
    // Si el producto tiene un ID, es una actualización (UPDATE)
    if (productData.id) {
      const { id, ...updateData } = productData;
      const { error } = await supabase.from('products').update(updateData).eq('id', id);
      if (error) {
        alert('Error al actualizar el producto: ' + error.message);
      }
    } else { // Si no tiene ID, es una creación (INSERT)
      const { error } = await supabase.from('products').insert(productData);
       if (error) {
        alert('Error al crear el producto: ' + error.message);
      }
    }
    onProductSaved(); // Le avisamos a la página principal que refresque los datos
    onClose(); // Cerramos el modal
  };

  return (
    // Fondo oscuro semi-transparente
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Contenedor del modal */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '500px', color: 'black' }}>
        <h2>{productToEdit ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
        <ProductForm product={productToEdit} onSave={handleSave} onCancel={onClose} />
      </div>
    </div>
  );
}