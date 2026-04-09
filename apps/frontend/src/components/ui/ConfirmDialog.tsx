'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          icon: 'text-red-600'
        };
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          icon: 'text-yellow-600'
        };
      case 'info':
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: 'text-blue-600'
        };
    }
  };

  const variantClasses = getVariantClasses();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className="relative bg-background rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-4">
            <X className={`h-6 w-6 ${variantClasses.icon}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-muted-foreground mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${variantClasses.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}