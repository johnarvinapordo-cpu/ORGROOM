import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App/>);

// Android-ready PWA support. The service worker is only enabled in
// production so normal Vite development remains unchanged.
if(import.meta.env.PROD && 'serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}
