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
    if (onEdit) {
      onEdit(dashboard.id);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <Link
      href={`/design/${dashboard.id}`}
      className="group relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Thumbnail Preview */}
        <div className="aspect-video bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 relative">
          {/* Placeholder for dashboard preview */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FaChartLine className="text-4xl text-purple-600 dark:text-purple-400 opacity-50" />
          </div>

          {/* Hover Overlay with Action Buttons */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {/* View Button - Green */}
            <button
              onClick={handleView}
              className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all transform hover:scale-110 shadow-lg"
              title="View Dashboard"
            >
              <FaEye size={18} />
            </button>

            {/* Edit Button - Blue */}
            <button
              onClick={handleEdit}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg"
              title="Edit Dashboard"
            >
              <FaEdit size={18} />
            </button>

            {/* Download Button - Purple */}
            <button
              onClick={handleDownload}
              className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all transform hover:scale-110 shadow-lg"
              title="Download Dashboard"
            >
              <FaDownload size={18} />
            </button>

            {/* Delete Button - Red */}
            <button
              onClick={handleDelete}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg"
              title="Delete Dashboard"
            >
              <FaTrash size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100 truncate">
            {dashboard.name}
          </h3>

          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dashboard.widgets.length} {dashboard.widgets.length === 1 ? 'widget' : 'widgets'}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-500">
              {dashboard.updatedAt ? (
                <>Updated {formatDistanceToNow(new Date(dashboard.updatedAt), { addSuffix: true })}</>
              ) : (
                'Recently created'
              )}
            </p>
          </div>

          {/* Public Badge */}
          {dashboard.isPublic && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                Public
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}