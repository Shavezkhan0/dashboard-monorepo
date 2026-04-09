'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient, useDashboards, useDeleteDashboard } from '@dashboard/api-client';
import { formatDistanceToNow } from 'date-fns';
import { FaPlus, FaChartLine, FaClock, FaTrash } from 'react-icons/fa';
import { LogIn } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ThemeTest from '@/components/ui/ThemeTest';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token, logout } = useAuthContext();
  const [client, setClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    if (token) {
      setClient(new ApiClient(API_URL, () => token));
    }
  }, [token]);

  const { data: dashboards, isLoading: dashboardsLoading } = useDashboards(client!, {
    enabled: !!client && isAuthenticated,
  });

  const deleteMutation = useDeleteDashboard(client!);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setDashboardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (dashboardToDelete) {
      deleteMutation.mutate(dashboardToDelete, {
        onSuccess: () => {
          toast.success('Dashboard deleted successfully');
        },
        onError: (error) => {
          toast.error('Failed to delete dashboard');
          console.error('Delete error:', error);
        }
      });
    }
    setIsDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDashboardToDelete(null);
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Dashboard Builder</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => router.push('/auth/login')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <LogIn size={16} />
              Login
            </button>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-4">
          <h1 className="text-5xl font-bold text-center">Build Beautiful Dashboards</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Create interactive data visualizations and dashboards with our powerful editor
          </p>
          <div className="flex gap-4">
            <Link
              href="/preview"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-lg font-medium"
            >
              Try Preview
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-lg font-medium"
            >
              Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">My Dashboards</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => router.push('/auth/login')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <LogIn size={16} />
            Login
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <ThemeTest />
        {dashboardsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : dashboards?.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No dashboards yet</h2>
            <Link
              href="/design"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create your first dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards?.map((dashboard) => (
              <div
                key={dashboard.id}
                className="group relative bg-card border rounded-lg hover:shadow-md transition group-hover:border-indigo-600 h-full flex flex-col"
              >
                <Link
                  href={`/design/${dashboard.id}`}
                  className="absolute inset-0 z-0"
                  aria-label={`Open ${dashboard.name}`}
                />

                <div className="p-6 flex flex-col h-full pointer-events-none">
                  <div className="flex items-start justify-between mb-4 pointer-events-auto">
                    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 mb-4">
                      <FaChartLine size={24} />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, dashboard.id)}
                      className="text-muted-foreground hover:text-red-500 p-2 transition-colors z-10 cursor-pointer"
                      title="Delete Dashboard"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 pointer-events-auto">
                    {dashboard.name}
                  </h3>

                  <div className="mt-auto flex items-center text-sm text-muted-foreground gap-2">
                    <FaClock size={12} />
                    <span>
                      Updated {dashboard.updated_at ? formatDistanceToNow(new Date(dashboard.updated_at), { addSuffix: true }) : 'recently'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Dashboard?"
        message="Are you sure you want to delete this dashboard? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
