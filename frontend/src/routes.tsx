import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/layout';
import { Home, Dashboard, NotFound } from './pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/dashboard',
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/video/:id',
    element: <Layout><div className="text-center py-12">Video Analysis Page (Coming Soon)</div></Layout>,
  },
  {
    path: '/channel/:id',
    element: <Layout><div className="text-center py-12">Channel Analysis Page (Coming Soon)</div></Layout>,
  },
  {
    path: '/recommendations',
    element: <Layout><div className="text-center py-12">Recommendations Page (Coming Soon)</div></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><div className="text-center py-12">Settings Page (Coming Soon)</div></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
