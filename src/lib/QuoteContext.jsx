'use client';

import { createContext, useContext, useState } from 'react';

const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quotePrefill,setQuotePrefill]=useState('');

  const openQuote = (prefill='') => {setQuotePrefill(typeof prefill==='string'?prefill:'');setIsQuoteOpen(true);};
  const closeQuote = () => setIsQuoteOpen(false);

  return (
    <QuoteContext.Provider value={{ isQuoteOpen, openQuote, closeQuote,quotePrefill }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    return {
      isQuoteOpen: false,
      openQuote: () => {},
      closeQuote: () => {},
    };
  }
  return context;
}
