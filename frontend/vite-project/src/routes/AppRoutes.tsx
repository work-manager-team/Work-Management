// routes/AppRoutes.tsx
import Dashboard from '../pages/dashboard/Dashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Other routes */}
    </Routes>
  );
}