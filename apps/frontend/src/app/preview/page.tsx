'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';
import DesignHeader from '@/components/design/header/DesignHeader';
import { CanvasProvider } from '@/contexts/CanvasContext';
import Sidebar from '@/components/design/sidebar/Sidebar';
import CanvasEditor from '@/components/design/canvas/CanvasEditor';
import AuthDialog from '@/components/auth/AuthDialog';

export default function PreviewPage() {
  const router = useRouter();
  const { isAuthenticated, setPendingRedirect } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [tempDashboardData, setTempDashboardData] = useState(null);
  
  const handleSaveAttempt = (dashboardData: any) => {
    if (!isAuthenticated) {
      setTempDashboardData(dashboardData);
      setPendingRedirect(window.location.pathname);
      setShowAuthDialog(true);
    }
  };
  
  const handleAuthSuccess = () => {
    if (tempDashboardData) {
      sessionStorage.setItem('tempDashboard', JSON.stringify(tempDashboardData));
    }
    router.push('/design');
  };
  
  return (
    <>
      <CanvasProvider 
        dashboardId={null} 
        client={null}
        onSaveAttempt={handleSaveAttempt}
      >
        <main className="flex flex-col h-screen bg-background">
          <header className="bg-background shadow-sm border-b px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600">Dashboard Preview</h1>
            <button
              onClick={() => setShowAuthDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <LogIn size={16} />
              Login
            </button>
          </header>
          
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <CanvasEditor />
          </div>
        </main>
      </CanvasProvider>
      
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}