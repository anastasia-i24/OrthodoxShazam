import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AudioRecording from './pages/AudioRecording';
import ServiceText from './pages/ServiceText';
import NotFound from './pages/NotFound';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AudioRecording />,
    errorElement: <NotFound />
  },
  {
    path: '/service-text',
    element: <ServiceText />,
    errorElement: <NotFound />
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
