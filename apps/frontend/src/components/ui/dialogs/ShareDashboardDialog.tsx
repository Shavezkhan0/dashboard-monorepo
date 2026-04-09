'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

interface ShareDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareLink: string;
  shareStatus: string;
  shareError: string;
  linkCopied: boolean;
  onShareLink: () => void;
  onCopyLink: () => void;
  onOpenInNewTab: () => void;
}

export default function ShareDashboardDialog({
  open,
  onOpenChange,
  shareLink,
  shareStatus,
  shareError,
  linkCopied,
  onShareLink,
  onCopyLink,
  onOpenInNewTab,
}: ShareDashboardDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-2xl w-[500px] max-w-[90vw]">
          <div className="flex justify-between items-center p-4 border-b">
            <Dialog.Title className="text-xl text-foreground font-semibold">
              Share Dashboard
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full text-foreground hover:bg-muted" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6">
            {shareStatus === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-muted-foreground">Creating shareable link...</span>
              </div>
            )}

            {shareStatus === 'success' && (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 mb-4">
                  <CheckCircle size={20} className="mr-2" />
                  <span className="font-medium">Link created successfully!</span>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Shareable Link:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 text-foreground px-3 py-2 border border-border rounded-md bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={onCopyLink}
                      className="flex items-center justify-center gap-1 px-3 py-2 border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium hover:border-0 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} className="mr-1" />
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={onOpenInNewTab}
                      className="flex items-center justify-center gap-1 px-3 py-2 border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium hover:border-0 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} className="mr-1" />
                      Open
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  Anyone with this link can view your dashboard. The link will remain active until you delete the shared dashboard.
                </p>
              </div>
            )}

            {shareStatus === 'error' && (
              <div className="space-y-4">
                <div className="flex items-center text-red-600 mb-4">
                  <AlertCircle size={20} className="mr-2" />
                  <span className="font-medium">Failed to create link</span>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{shareError}</p>
                </div>

                <button
                  onClick={onShareLink}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}