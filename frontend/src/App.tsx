import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { AddURL } from "./components/AddURL";
import { URLTable } from "./components/URLTable";
import { URLDetails } from "./components/URLDetails";
import { AuthProvider, useAuth } from "./components/providers/AuthProvider";
import type { URL } from "./types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { user, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<URL | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
        isRegisterMode={isRegisterMode}
      />
    );
  }

  if (selectedUrl) {
    return (
      <Layout>
        <URLDetails
          urlId={selectedUrl.id}
          onBack={() => setSelectedUrl(null)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <AddURL />
        <URLTable onViewDetails={setSelectedUrl} />
      </div>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
