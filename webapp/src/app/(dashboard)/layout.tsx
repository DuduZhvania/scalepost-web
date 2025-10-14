// app/(dashboard)/layout.tsx
import DashboardLayout from '../../../components/DashboardLayout';
import { UploadModalProvider } from '@/hooks/useUploadModal';
import { UploadModal } from '@/components/upload/UploadModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UploadModalProvider>
      <DashboardLayout>{children}</DashboardLayout>
      <UploadModal />
    </UploadModalProvider>
  );
}
