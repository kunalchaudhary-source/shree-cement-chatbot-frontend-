import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminPanel from './components/AdminPanel';
import '../styles/admin.css';
import '../styles/chatbot.css';

const container = document.getElementById('admin-root');
if (container) {
  const root = createRoot(container);
  root.render(<AdminPanel />);
}
