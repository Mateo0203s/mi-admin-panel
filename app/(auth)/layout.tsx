// app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container">
      {/* Estas clases de Bootstrap hacen lo siguiente:
        - vh-100: Ocupa el 100% de la altura de la pantalla.
        - d-flex: Activa el modo Flexbox.
        - justify-content-center: Centra el contenido horizontalmente.
        - align-items-center: Centra el contenido verticalmente.
      */}
      <div className="d-flex justify-content-center align-items-center vh-100">
        
        {/*
          Esta columna limita el ancho del formulario para que no se vea
          demasiado grande en pantallas anchas.
        */}
        <div className="col-md-6 col-lg-4">
          {children} {/* Aquí se renderizará tu página de login */}
        </div>
        
      </div>
    </div>
  );
}