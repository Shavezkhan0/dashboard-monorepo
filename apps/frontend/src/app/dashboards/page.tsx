'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@dashboard/api-client';
import { useDashboards, useDeleteDashboard } from '@dashboard/api-client';
import type { Dashboard } from '@dashboard/shared-types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ProfileDropdown from '@/components/account/ProfileDropdown';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { FaPlus, FaSearch } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Category icons data
const categories = [
  { name: 'Presentation', icon: '📊', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  { name: 'Social Media', icon: '📱', color: 'bg-pink-500/20 text-pink-600 dark:text-pink-400' },
  { name: 'Documents', icon: '📄', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  { name: 'Video', icon: '🎥', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  { name: 'Print Products', icon: '🖨️', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  { name: 'More', icon: '➕', color: 'bg-muted text-muted-foreground' },
];

export default function DashboardsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token, user } = useAuthContext();
  const [client, setClient] = useState<ApiClient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('designs');

  useEffect(() => {
    if (token) {
      setClient(new ApiClient(API_URL, () => token));
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const { data: dashboards, isLoading } = useDashboards(client!, {
    enabled: !!client && isAuthenticated,
  });

  const deleteMutation = useDeleteDashboard(client!);

  const handleDelete = async (id: string) => {
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

  // Filter dashboards based on search query
  const filteredDashboards = dashboards?.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Search */}
            <div className="flex items-center space-x-6">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                What will you design today?
              </h1>

              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search dashboards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <ProfileDropdown userName={user?.name} userEmail={user?.email} />
              <Link
                href="/design"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                <FaPlus size={14} />
                Create New Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('designs')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'designs'
              ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Your designs
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'templates'
              ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'ai'
              ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            AI Design
          </button>
        </div>

        {/* Category Icons */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className="flex flex-col items-center space-y-2 p-4 rounded-xl hover:bg-muted transition-colors min-w-fit"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${category.color}`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-foreground">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-foreground">
            {activeTab === 'designs' ? 'Your Recent Designs' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </h2>

          {activeTab === 'designs' && filteredDashboards.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                {searchQuery ? 'No dashboards found' : 'Start creating amazing dashboards'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try a different search term' : 'Design beautiful, interactive dashboards with our easy-to-use tools'}
              </p>
              {!searchQuery && (
                <Link
                  href="/design"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  <FaPlus size={16} />
                  Create your first dashboard
                </Link>
              )}
            </div>
          ) : activeTab === 'templates' ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Templates will be available soon!</p>
            </div>
          ) : activeTab === 'ai' ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">AI Design Coming Soon</h3>
              <p className="text-muted-foreground">Generate dashboards with AI!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDashboards.map((dashboard: Dashboard) => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirm Dialog */}
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