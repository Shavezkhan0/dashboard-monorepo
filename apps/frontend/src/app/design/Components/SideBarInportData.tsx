'use client';
import * as Dialog from '@radix-ui/react-dialog';
import React, { useState } from 'react'
import { X } from "lucide-react";
import GetData from './Data/GetData';
import Connectserver from './Data/Connectserver';

const SideBarInportData = () => {
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
          className={`p-2 rounded text-xs cursor-pointer hover:bg-white hover:border hover:border-2 hover:border-gray
          ${activeTab === "getdata" ? "bg-white text-black" : "text-gray-400 bg-gray-100"} `}>Data</button>
        <button
          onClick={handleChangeConnectserver}
          className={`p-2 rounded text-xs cursor-pointer hover:bg-white hover:border hover:border-2 hover:border-gray
          ${activeTab === "connectserver" ? "bg-white text-black" : "text-gray-400 bg-gray-100"} `}>Server</button>
      </div>

      {/* pop option */}
      <Dialog.Root open={popupOpen} onOpenChange={handlePopupClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 " />
          <Dialog.Content className="fixed top-1/2 left-1/2 overflow-y-auto z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-[60vw]">
            {popupOpen && (
              <>
                {activeTab === "getdata" && (
                  <>
                    <div className="flex justify-between items-center p-2 border-b ">
                      <Dialog.Title className="text-normal text-black font-semibold">Get Data</Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="p-1 rounded-full hover:bg-gray-200 text-black" aria-label="Close">
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
                    <div className="flex justify-between items-center p-2 border-b ">
                      <Dialog.Title className="text-normal font-semibold text-black">Connect to Server</Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="p-1 rounded-full hover:bg-gray-200 text-black" aria-label="Close">
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

export default SideBarInportData;
