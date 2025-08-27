import './globals.css';
import SmoothScroll from './SmoothScroll';
import { Toaster } from 'react-hot-toast';

// ✅ Add metadata with favicon + logo
export const metadata = {
  title: "Protein Guru.ai",
  description: "India’s protein co-pilot",
  icons: {
    icon: "/favicon.ico",        // browser tab icon
    shortcut: "/favicon.ico",
    apple: "/logo.png",          // iOS/Apple devices
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* fallback link tags in case metadata doesn't catch */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <SmoothScroll />
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f0f10',
              border: '1px solid #5c6e49',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#5c6e49',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
