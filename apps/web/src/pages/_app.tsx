import React from 'react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/components/ui/Toast';

export default function App({ Component, pageProps }: any) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}
