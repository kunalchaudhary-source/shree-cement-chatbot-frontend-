import React from 'react';
import { createRoot } from 'react-dom/client';
import MasterControl from './MasterControl';

const root = createRoot(document.getElementById('mc-root'));
root.render(<MasterControl />);
