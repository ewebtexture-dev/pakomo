"use client";

import { QuoteProvider } from "@/lib/QuoteContext";

export default function RootProviders({ children }) {
  return <QuoteProvider>{children}</QuoteProvider>;
}
