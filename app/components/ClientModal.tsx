'use client'

import ClientForm from './ClientForm';
import type { Client } from '../(app)/clientes/page'; // Importamos el tipo desde la página principal

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Aseguramos que espera 'onSave'
  clientToEdit: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSave, clientToEdit }: ClientModalProps) {
  if (!isOpen) {
    return null;
  }

  const modalTitle = clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente';

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{modalTitle}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <ClientForm 
              clientToEdit={clientToEdit}
              onSave={onSave} // Pasa la función 'onSave' al formulario
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}