import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HostelListings from './pages/HostelListings';
import HostelOwners from './pages/HostelOwners';
import HostelDetail from './pages/HostelDetail';
import ApprovalModal from './pages/ApprovalModal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — Standalone pages */}
          <Route path="/hostels/:id" element={<ProtectedRoute><HostelDetail /></ProtectedRoute>} />
          <Route path="/hostels/:id/approve" element={<ProtectedRoute><ApprovalModal /></ProtectedRoute>} />

          {/* Protected — Dashboard layout pages */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/hostels" element={<ProtectedRoute><HostelListings /></ProtectedRoute>} />
          <Route path="/hostel-owners" element={<ProtectedRoute><HostelOwners /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
