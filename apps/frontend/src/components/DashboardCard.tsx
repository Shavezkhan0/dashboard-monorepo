'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { FaChartLine, FaTrash, FaEdit, FaEye, FaDownload } from 'react-icons/fa';
import type { Dashboard } from '@dashboard/shared-types';

interface DashboardCardProps {
  dashboard: Dashboard;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DashboardCard({ dashboard, onDelete, onEdit }: DashboardCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(dashboard.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to edit page
    router.push(`/design/${dashboard.id}`);
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to view page
    router.push(`/design/view/${dashboard.id}`);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement download functionality
    console.log('Download dashboard:', dashboard.id);
    alert('Download feature coming soon!');
  };

  return (
    <div
      className="group relative block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden h-full">
        {/* Thumbnail Preview */}
        <div className="aspect-video bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-purple-900/50 dark:via-blue-900/50 dark:to-pink-900/50 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Dashboard Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`transition-all duration-300 ${isHovered ? 'scale-75 opacity-30' : 'scale-100 opacity-50'}`}>
              <FaChartLine className="text-5xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Hover Overlay with Action Buttons */}
          <div
            className={`absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 backdrop-blur-sm flex items-center justify-center gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
          >
            {/* View Button - Green */}
            <button
              onClick={handleView}
              className="p-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-95 transition-all transform hover:scale-110 shadow-lg hover:shadow-green-500/50 cursor-pointer"
              title="View Dashboard"
            >
              <FaEye size={20} />
            </button>

            {/* Edit Button - Blue */}
            <button
              onClick={handleEdit}
              className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all transform hover:scale-110 shadow-lg hover:shadow-blue-500/50 cursor-pointer"
              title="Edit Dashboard"
            >
              <FaEdit size={20} />
            </button>

            {/* Download Button - Purple */}
            <button
              onClick={handleDownload}
              className="p-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-95 transition-all transform hover:scale-110 shadow-lg hover:shadow-purple-500/50 cursor-pointer"
              title="Download Dashboard"
            >
              <FaDownload size={20} />
            </button>

            {/* Delete Button - Red */}
            <button
              onClick={handleDelete}
              className="p-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-95 transition-all transform hover:scale-110 shadow-lg hover:shadow-red-500/50 cursor-pointer"
              title="Delete Dashboard"
            >
              <FaTrash size={20} />
            </button>
          </div>

          {/* Top Right Badge - Widget Count */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {dashboard.widgets.length} {dashboard.widgets.length === 1 ? 'widget' : 'widgets'}
              </p>
            </div>
          </div>

          {/* Public Badge - Top Left */}
          {dashboard.isPublic && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-full shadow-lg">
                Public
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {dashboard.name}
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {dashboard.updatedAt ? (
                  <>Updated {formatDistanceToNow(new Date(dashboard.updatedAt), { addSuffix: true })}</>
                ) : (
                  'Recently created'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Border Effect */}
        <div className={`h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
    </div>
  );
}