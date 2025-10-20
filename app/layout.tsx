// app/layout.tsx

import { Metadata } from 'next';
// Es mejor importar el CSS de Bootstrap directamente si lo instalaste con npm,
// pero mantener los links CDN como los tenías también funciona.
import 'bootstrap/dist/css/bootstrap.min.css';

export const metadata: Metadata = {
  title: 'Sistema La Huerta',
  description: 'Sistema de gestión verduras y huevos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Mantengo tus links CDN por consistencia */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        {children}
        {/* El JS de Bootstrap también puede ir aquí si lo necesitas globalmente */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  );
}