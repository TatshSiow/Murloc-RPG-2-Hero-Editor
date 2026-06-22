import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { App } from './App';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Analytics />
    <SpeedInsights />
  </>,
);
