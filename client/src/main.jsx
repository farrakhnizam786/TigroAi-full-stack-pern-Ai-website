import './index.css';
import React from 'react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';

// Debugging: Log environment variables
console.log('Environment:', import.meta.env);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error('Missing Clerk Publishable Key. Please check:');
  console.error('1. Your .env file exists in the project root');
  console.error('2. The key is named VITE_CLERK_PUBLISHABLE_KEY');
  console.error('3. You restarted the dev server after adding the key');
  throw new Error("Missing Clerk Publishable Key");
}

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none"
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)
