// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';

import { bootstrapGraphQLRuntime } from '@/app/bootstrap';
import { AdminAuthProvider, AuthProvider, GraphQLProvider, ThemeProvider } from '@/app/providers';
import { App } from '@/app/router';

import './index.css';

bootstrapGraphQLRuntime();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <GraphQLProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </GraphQLProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </React.StrictMode>,
);
