import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import OperationLoader from "./components/OperationLoader"; // Importar el nuevo loader
import PrivateRoute from "./components/PrivateRoute";
import SuccessNotification from "./components/SuccessNotification";
import EditorPage from "./pages/Editor";
import HomePage from "./pages/Home";
import { Login } from "./pages/Login";
import ProfilePage from "./pages/Profile";
import { useServerStatusStore } from "./stores/serverStatusStore";

function App() {
  const { checkServerStatus } = useServerStatusStore();

  useEffect(() => {
    console.log("App mounted, checking server status for the first time.");
    checkServerStatus(true);

    const intervalId = setInterval(() => {
      console.log("Periodic server status check.");
      checkServerStatus();
    }, 60000);
    return () => clearInterval(intervalId);
  }, [checkServerStatus]);

  return (
    <>
      <OperationLoader />
      <SuccessNotification />
      <Layout>
        {/* Routes envuelve todas las rutas individuales */}
        <Routes>
          {/* Route define una ruta específica */}
          {/* path="/" coincide con la URL raíz. element={...} renderiza el componente */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/editor"
            element={
              <PrivateRoute>
                <EditorPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Define otras rutas según las secciones de tu app */}

          {/* Ejemplo para una ruta no encontrada (opcional) */}
          <Route path="*" element={<div>Página No Encontrada (404)</div>} />
        </Routes>

        {/* Puedes tener un pie de página global aquí */}
      </Layout>
    </>
  );
}

export default App;
