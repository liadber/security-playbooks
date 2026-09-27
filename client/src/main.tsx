import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ROOT_ELEMENT_ID } from './app/app.constants';
import './shared/styles/variables.css';
import './shared/styles/global.css';

const root = document.getElementById(ROOT_ELEMENT_ID);
if (!root) {
  throw new Error(`Element #${ROOT_ELEMENT_ID} not found`);
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
