'use client';

import { useRef, useEffect, useState } from 'react';
import { Dashboard } from '@dashboard/shared-types';
import { BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardPreviewCardProps {
  dashboard: Dashboard;
  onClick: () => void;
}

export default function DashboardPreviewCard({ dashboard, onClick }: DashboardPreviewCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWidgets, setHasWidgets] = useState(false);
  
  useEffect(() => {
    // Generate preview thumbnail from widgets
    if (canvasRef.current && dashboard.widgets && dashboard.widgets.length > 0) {
      setHasWidgets(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas size
        canvas.width = 480;
        canvas.height = 320;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 480, 320);
        gradient.addColorStop(0, '#6366f1'); // indigo-500
        gradient.addColorStop(1, '#8b5cf6'); // violet-500
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 480, 320);
        
        // Draw widget representations
        dashboard.widgets.slice(0, 3).forEach((widget, index) => {
          const x = 40 + (index * 150);
          const y = 80;
          const width = 120;
          const height = 120;
          
          // Draw widget background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(x, y, width, height);
          
          // Draw simple chart representation based on widget type
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          
          if (widget.type === 'bar') {
            // Draw bars
            for (let i = 0; i < 4; i++) {
              const barHeight = 40 + Math.random() * 60;
              const barX = x + 15 + (i * 25);
              const barY = y + height - 20 - barHeight;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
              ctx.fillRect(barX, barY, 18, barHeight);
            }
          } else if (widget.type === 'line') {
            // Draw line
            ctx.beginPath();
            ctx.moveTo(x + 15, y + height - 30);
            for (let i = 1; i < 5; i++) {
              const pointX = x + 15 + (i * 25);
              const pointY = y + 30 + Math.random() * 70;
              ctx.lineTo(pointX, pointY);
            }
            ctx.stroke();
          } else if (widget.type === 'pie' || widget.type === 'donut') {
            // Draw pie/donut
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            const radius = 40;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 0.6);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
          } else {
            // Generic chart icon
            ctx.font = '48px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.textAlign = 'center';
            ctx.fillText('📊', x + width / 2, y + height / 2 + 15);
          }
        });
      }
    }
  }, [dashboard]);
  
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition group"
    >
      {/* Preview Thumbnail */}
      <div className="relative bg-gradient-to-br from-indigo-500 to-violet-500 h-48 flex items-center justify-center overflow-hidden">
        {hasWidgets ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'crisp-edges' }}
          />
        ) : (
          <div className="text-white/30">
            <BarChart3 size={64} strokeWidth={1.5} />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
      </div>
      
      {/* Card Content */}
      <div className="p-5 bg-gray-900 dark:bg-gray-950 text-white">
        <h3 className="text-lg font-semibold mb-2 truncate group-hover:text-indigo-400 transition">
          {dashboard.name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{dashboard.widgets?.length || 0} widgets</span>
          <span>
            {dashboard.updatedAt 
              ? formatDistanceToNow(new Date(dashboard.updatedAt), { addSuffix: true })
              : 'Recently created'}
          </span>
        </div>
      </div>
    </div>
  );
}