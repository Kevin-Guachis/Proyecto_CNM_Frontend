import React, { useState, useEffect } from 'react'
import SolicitudesDocente from './SolicitudesDocente.jsx'
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layout/Layout.jsx';
import Header from '../../../components/Header.jsx';
import Loading from '../../../components/Loading.jsx';
import axios from 'axios';
import { getModulos, transformModulesForLayout } from '../../getModulos.jsx';
import { useAuth } from '../../../Utils/useAuth.js';


function Index() {
  // Protección de ruta
  const auth = useAuth(["Profesor", "Inspector"]);
  
  // Si no está autenticado, no renderizar nada
  if (!auth.isAuthenticated) {
    return null;
  }

  const [usuario, setUsuario] = useState(null);
  const [modules, setModules] = useState([]);
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(false)
  const API_URL = import.meta.env.VITE_URL_DEL_BACKEND;
  const token=localStorage.getItem("token")
  const navigate = useNavigate()
  
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser || (parsedUser.subRol !== "Profesor" && parsedUser.subRol !== "Inspector")) {
      navigate("/")
    }
    setUsuario(parsedUser);
    // Configurar módulos del Profesor
    setModules(transformModulesForLayout(getModulos(parsedUser.subRol, true)));
  }, [API_URL, navigate]);
  useEffect(() => {
    axios.get(`${API_URL}/solicitud/obtener/docente/`,{
        headers: { Authorization: `Bearer ${token}` },
      })
    .then(res=>{
        setLoading(false)
        setSolicitudes(res.data)
    })
  }, [])
    const aceptadas = solicitudes.filter(s => s.estado === "Aceptada");
    const rechazadas = solicitudes.filter(s => s.estado === "Rechazada");
    const cantidad = (aceptadas?.length || 0) + (rechazadas?.length || 0);

  const handleSidebarNavigation = (path) => {
    setLoading(true);
    setTimeout(() => navigate(path), 800);
  };

  return (
    <div className="section-container">
      {/* Encabezado */}
      <div className="container-fluid p-0">
        {usuario && <Header isAuthenticated={true} usuario={usuario} />}
      </div>
      <Layout modules={modules} onNavigate={handleSidebarNavigation}>
        {loading ? <Loading /> : <SolicitudesDocente usuario={usuario} solicitudes={solicitudes} setSolicitudes={setSolicitudes}/>}
      </Layout>
    </div>
  )
}

export default Index