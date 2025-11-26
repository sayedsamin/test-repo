"use client"

import React, { Suspense, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/hooks/use-auth"
import { Footer } from "@/components/footer"  // ⬅️ import footer

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <>
            {children}
            <Footer />  {/* ⬅️ Footer now appears on ALL pages */}
          </>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default RootLayoutClient
