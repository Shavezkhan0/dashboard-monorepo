'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FaChartLine, FaTrash, FaEdit } from 'react-icons/fa';
import type { Dashboard } from '@dashboard/shared-types';

interface DashboardCardProps {
  dashboard: Dashboard;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DashboardCard({ dashboard, onDelete, onEdit }: DashboardCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

          {/* Hover Actions */}
          <div className={`absolute top-2 right-2 flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleEdit}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              title="Edit Dashboard"
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              title="Delete Dashboard"
            >
              <FaTrash size={14} />
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