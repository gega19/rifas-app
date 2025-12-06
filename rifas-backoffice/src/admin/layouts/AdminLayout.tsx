import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { AdminHeader } from '../components/AdminHeader';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div style={{ marginLeft: '256px', minHeight: '100vh' }}>
        <AdminHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

