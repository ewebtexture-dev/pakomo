import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { AuthProvider } from '@/lib/AuthContext';
import { QuoteProvider } from '@/lib/QuoteContext';

export default function App({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <QuoteProvider>
          {children}
          <Toaster />
        </QuoteProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}
