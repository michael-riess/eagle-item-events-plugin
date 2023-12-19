import 'vite/modulepreload-polyfill';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './src/App.tsx';
import { Watcher } from './src/watcher';

const watcher = new Watcher();

document.body.innerHTML = '<div id="app"></div>';
createRoot(document.getElementById('app') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
