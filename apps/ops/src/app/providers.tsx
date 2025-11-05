'use client';

import { Toaster as Exatoast } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Exatoast position="top-center" expand richColors />
    </>
  );
}
