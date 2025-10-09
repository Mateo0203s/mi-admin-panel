'use client'

import { supabase } from '@/lib/supabaseClient';
import ClientForm, { Client } from './ClientForm'; // Importamos el formulario y la interfaz

// Propiedades que recibe el Modal
interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit: Client | null;
  onClientSaved: () => void; // Función para refrescar la lista de clientes
}

export default function ClientModal({ isOpen, onClose, clientToEdit, onClientSaved }: ClientModalProps) {
  if (!isOpen) return null;

  const handleSave = async (clientData: Client) => {
    // Para actualizar, necesitamos el ID.
    if (clientData.id) {
      const { id, ...updateData } = clientData;
      const { error } = await supabase.from('users').update(updateData).eq('id', id);
      
      if (error) {
        alert('Error al actualizar el cliente: ' + error.message);
      } else {
        alert('Cliente actualizado con éxito!');
        onClientSaved(); // Le avisamos a la página principal que refresque los datos
        onClose(); // Cerramos el modal
      }
    } else {
        alert('No se puede guardar un cliente sin ID.');
    }
  };

  return (
    // Fondo oscuro semi-transparente
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Contenedor del modal */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '500px', color: 'black' }}>
        <h2>Editar Cliente</h2>
        <ClientForm client={clientToEdit} onSave={handleSave} onCancel={onClose} />
      </div>
    </div>
  );
}