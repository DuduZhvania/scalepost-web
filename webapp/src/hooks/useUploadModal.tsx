// hooks/useUploadModal.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type UploadModalTab = 'file' | 'url';

interface UploadModalContextType {
  isOpen: boolean;
  initialTab: UploadModalTab;
  open: (options?: { tab?: UploadModalTab }) => void;
  close: () => void;
}

const UploadModalContext = createContext<UploadModalContextType | undefined>(undefined);

export function UploadModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ isOpen: boolean; initialTab: UploadModalTab }>({
    isOpen: false,
    initialTab: 'file',
  });

  const open = useCallback((options?: { tab?: UploadModalTab }) => {
    setState({ isOpen: true, initialTab: options?.tab ?? 'file' });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <UploadModalContext.Provider
      value={{ isOpen: state.isOpen, initialTab: state.initialTab, open, close }}
    >
      {children}
    </UploadModalContext.Provider>
  );
}

export function useUploadModal() {
  const context = useContext(UploadModalContext);
  if (!context) {
    throw new Error('useUploadModal must be used within UploadModalProvider');
  }
  return context;
}
