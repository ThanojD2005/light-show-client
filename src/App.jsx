import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShowProvider } from './context/ShowContext';
import AudienceView from './pages/AudienceView';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ShowProvider isAdmin={false}>
              <AudienceView />
            </ShowProvider>
          }
        />
        <Route
          path="/admin"
          element={
            <ShowProvider isAdmin={true}>
              <AdminDashboard />
            </ShowProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
