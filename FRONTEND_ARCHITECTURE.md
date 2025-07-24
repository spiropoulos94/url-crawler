# Frontend Architecture Overview

## Core Technologies

- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Query for server state
- React Router for navigation
- Axios for API communication

## Application Structure

### 1. Core Application Setup

The application entry point (`src/App.tsx`) sets up the core providers and routing:

```tsx
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### 2. Authentication & Authorization

Authentication is managed through the `AuthProvider` (`src/components/providers/AuthProvider.tsx`):

```tsx
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Authentication methods
  const login = async (data: LoginRequest) => {
    const response = await authAPI.login(data);
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
  };

  // ... other auth methods
};
```

Protected routes are implemented using a `ProtectedRoute` component:

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}
```

### 3. Component Organization

```
src/components/
├── ui/                 # Atomic UI components
├── features/          # Feature-specific components
├── layout/           # Layout components
└── providers/        # Context providers
```

#### UI Components

Atomic components are exported through a barrel file (`src/components/ui/index.ts`):

```tsx
export * from "./Typography";
export * from "./Layout";
export * from "./Button";
// ... other exports
```

#### Feature Components

Complex feature components like `URLTable` combine multiple UI components:

```tsx
export const URLTable: React.FC = () => {
  const { data, isLoading } = useURLs(params);
  return (
    <Card>
      <TableHeader />
      {data.map((url) => (
        <URLTableRow key={url.id} url={url} />
      ))}
    </Card>
  );
};
```

### 4. Custom Hooks

The application uses custom hooks for:

#### Data Fetching (`src/hooks/useURLs.ts`)

```tsx
export const useURLs = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["urls", params],
    queryFn: () => urlAPI.getAll(params),
  });
};
```

#### Form Management (`src/hooks/useForm.ts`)

```tsx
export function useForm<T>(
  initialData: T,
  validationRules?: ValidationRule<T>
) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isDirty: false,
  });
  // ... form logic
}
```

#### Pagination (`src/hooks/usePagination.ts`)

```tsx
export const usePagination = ({ initialPage = 1, initialLimit = 10 }) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  // ... pagination logic
};
```

### 5. API Communication

API calls are centralized in `src/services/api.ts`:

```tsx
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 6. Type System

Strong TypeScript typing is enforced throughout the application (`src/types/index.ts`):

```tsx
export interface URL {
  id: number;
  url: string;
  title: string;
  status: CrawlStatus;
  results?: CrawlResult[];
}

export type CrawlStatus = "queued" | "running" | "done" | "error" | "stopped";
```

### 7. State Management Pattern

The application follows a clear state management pattern:

1. **Server State**: Managed by React Query

   ```tsx
   const { data, isLoading } = useURLs(params);
   ```

2. **Form State**: Managed by custom `useForm` hook

   ```tsx
   const { formData, errors, setFieldValue } = useForm(initialData);
   ```

3. **UI State**: Managed by local React state

   ```tsx
   const [isOpen, setIsOpen] = useState(false);
   ```

4. **Auth State**: Managed by AuthContext
   ```tsx
   const { user, login, logout } = useAuth();
   ```

### 8. Error Handling

Comprehensive error handling is implemented through:

1. **Error Boundary**

```tsx
export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error logging
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

2. **API Error Handling**

```tsx
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 9. Performance Optimizations

1. **Debouncing**: Used in search inputs
2. **Memoization**: Used for expensive calculations and component re-renders
3. **Code Splitting**: Route-based code splitting
4. **Query Caching**: React Query's built-in caching

### 10. Styling Approach

The application uses TailwindCSS with a consistent pattern:

1. **Base Styles**: Applied through Tailwind classes
2. **Component Variants**: Implemented through class composition
3. **Responsive Design**: Mobile-first approach
4. **Theme Consistency**: Using design tokens

## Key Features

1. **Authentication Flow**

   - JWT-based authentication
   - Protected routes
   - Persistent sessions

2. **URL Management**

   - CRUD operations
   - Real-time status updates
   - Bulk actions

3. **Data Visualization**

   - Charts for link analysis
   - Heading distribution
   - Broken links tracking

4. **Search & Filter**
   - Debounced search
   - Column sorting
   - Pagination

## Best Practices

1. **Component Design**

   - Single responsibility
   - Props interface definition
   - Error boundary protection
   - Loading state handling

2. **Hook Usage**

   - Custom hooks for reusable logic
   - Proper cleanup in useEffect
   - Dependency array optimization
   - Memoization when needed

3. **Type Safety**

   - Strict TypeScript usage
   - Proper interface definitions
   - Type guards where necessary
   - Exhaustive type checking

4. **Performance**
   - React.memo for expensive renders
   - useMemo for expensive calculations
   - useCallback for callback stability
   - Proper key usage in lists
