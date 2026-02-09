'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';
import DesignHeader from '@/app/design/Components/DesignHeader';
import { CanvasProvider } from '@/app/design/Context/CanvasContext';
import Sidebar from '@/app/design/Components/Sidebar';
import CanvasEditor from '@/app/design/Components/CanvasEditor';
import AuthDialog from '@/components/AuthDialog';

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
        <main className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b px-6 py-4 flex justify-between items-center">
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