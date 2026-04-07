'use client';
import * as Dialog from '@radix-ui/react-dialog';
import React, { useState } from 'react'
import { X } from "lucide-react";
import GetData from './GetData';
import Connectserver from '@/components/shared/Connectserver';

const SidebarImportData = () => {
  const [activeTab, setActiveTab] = useState("")
  const [popupOpen, setPopupOpen] = useState(false);

  // The missing function and state variable are added for a complete fix
  const [selectedOption, setSelectedOption] = useState(null);
  const handlePopupClose = (open: boolean) => {
    setPopupOpen(open);
    if (!open) {
      setSelectedOption(null);
      setActiveTab("")
    }
  };

  const handleChangeData = () => {
    setActiveTab("getdata")
    setPopupOpen(true)
  }

  const handleChangeConnectserver = () => {
    setActiveTab("connectserver")
    setPopupOpen(true)
  }

  return (
    <>
      <div className='p-1 w-full grid grid-cols-2 gap-2 justify-center item-center rounded'>
        <button
          onClick={handleChangeData}
          className={`
    p-2 rounded text-xs cursor-pointer
    border-border
    hover:bg-background dark:hover:bg-muted
    hover:border-gray-400 dark:hover:border-gray-600
    ${activeTab === "getdata"
              ? "bg-background text-foreground border-gray-400 dark:border-gray-500"
              : "bg-muted text-muted-foreground"
            }
  `}
        >
          Data
        </button>

        <button
          onClick={handleChangeConnectserver}
          className={`
    p-2 rounded text-xs cursor-pointer
    border-border
    hover:bg-background dark:hover:bg-muted
    hover:border-gray-400 dark:hover:border-gray-600
    ${activeTab === "connectserver"
              ? "bg-background text-foreground border-gray-400 dark:border-gray-500"
              : "bg-muted text-muted-foreground"
            }
  `}
        >
          Server
        </button>

      </div>

      {/* pop option */}
      <Dialog.Root open={popupOpen} onOpenChange={handlePopupClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 " />
          <Dialog.Content className="fixed top-1/2 left-1/2 overflow-y-auto z-50 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-2xl w-[60vw]">
            {popupOpen && (
              <>
                {activeTab === "getdata" && (
                  <>
                    <div className="flex justify-between items-center p-2 border-b border-border">
                      <Dialog.Title className="text-normal text-foreground font-semibold">Get Data</Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="p-1 rounded-full hover:bg-muted text-foreground" aria-label="Close">
                          <X size={20} />
                        </button>
                      </Dialog.Close>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[80vh]">
                      <GetData onClose={() => setPopupOpen(false)} />
                    </div>
                  </>
                )}

                {activeTab === "connectserver" && (
                  <>
                    <div className="flex justify-between items-center p-2 border-b border-border">
                      <Dialog.Title className="text-normal font-semibold text-foreground">Connect to Server</Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="p-1 rounded-full hover:bg-muted text-foreground" aria-label="Close">
                          <X size={20} />
                        </button>
                      </Dialog.Close>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[80vh]">
                      <Connectserver />
                    </div>
                  </>
                )}
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export default SidebarImportData;
