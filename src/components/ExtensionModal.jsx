import React from 'react';
import { createPortal } from 'react-dom';

export default function ExtensionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b1220]/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-[#121a2b] border border-[#1e293b] rounded-2xl shadow-2xl p-8 max-w-lg w-full text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#1e293b] border border-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Add AdGenie to Browser</h2>
            <p className="text-sm text-gray-400">Install the developer preview</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#1e293b] text-xs font-bold flex items-center justify-center shrink-0 border border-white/10">1</div>
            <p className="text-sm text-gray-300">Click the button below to download <span className="font-mono text-cyan-400 bg-black/20 px-1 py-0.5 rounded">ad-genie-extension.zip</span> and extract it on your computer.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#1e293b] text-xs font-bold flex items-center justify-center shrink-0 border border-white/10">2</div>
            <p className="text-sm text-gray-300">Open <span className="font-mono text-cyan-400 bg-black/20 px-1 py-0.5 rounded">chrome://extensions/</span> (or <span className="font-mono text-cyan-400 bg-black/20 px-1 py-0.5 rounded">edge://extensions/</span>) in your browser address bar.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#1e293b] text-xs font-bold flex items-center justify-center shrink-0 border border-white/10">3</div>
            <p className="text-sm text-gray-300">Turn on <strong>Developer Mode</strong> in the top right, then click <strong>Load unpacked</strong> and select the extracted folder!</p>
          </div>
        </div>

        {/* Download Action */}
        <a 
          href="/ad-genie-extension.zip"
          download="ad-genie-extension.zip"
          className="w-full bg-[#4f46e5] hover:bg-[#6366f1] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
          onClick={() => {
            // Optional: close the modal shortly after downloading
            setTimeout(onClose, 1000);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Extension Zip
        </a>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            *Official Web Store version coming soon!
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
