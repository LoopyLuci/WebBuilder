import { jsx as _jsx } from "react/jsx-runtime";
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
export default function App({ Component, pageProps }) {
    return (_jsx(ErrorBoundary, { children: _jsx(ThemeProvider, { children: _jsx(ToastProvider, { children: _jsx(Component, { ...pageProps }) }) }) }));
}
//# sourceMappingURL=_app.js.map