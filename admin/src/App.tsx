// Fichier principal qui définit les routes de l'application d'administration Koosy
import './index.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Messages from './pages/messages';
import Users from './pages/users';
import Notifications from './pages/notifications';
import Biens from './pages/biens';

// Composant racine de l'application React
// Il configure le router et associe chaque URL à une page
function App() {
  return (
    // BrowserRouter gère l'historique et la navigation côté client
    <BrowserRouter>
      {/* Routes regroupe l'ensemble des routes de l'application */}
      <Routes>
        {/* Page de connexion */}
        <Route path="/login" element={<Login />} />

        {/* Tableau de bord principal */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Gestion des utilisateurs */}
        <Route path="/admin/users" element={<Users />} />

        {/* Page de messages / retours utilisateurs */}
        <Route path="/admin/messages" element={<Messages />} />

        {/* Centre de notifications du backoffice */}
        <Route path="/admin/notifications" element={<Notifications />} />

        {/* Gestion des biens liés aux utilisateurs */}
        <Route path="/admin/biens" element={<Biens />} />

        {/* Redirection par défaut vers la page de login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pour toute URL inconnue, on renvoie aussi vers /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
