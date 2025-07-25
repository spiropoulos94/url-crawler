import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./components/providers/AuthProvider";
import { ErrorProvider } from "./contexts/ErrorContext";
import { GlobalErrorToast } from "./components/GlobalErrorToast";
import { AppRoutes } from "./components/router/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
              <GlobalErrorToast />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;
