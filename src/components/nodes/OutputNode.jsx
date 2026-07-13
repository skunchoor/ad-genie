import { Handle, Position } from '@xyflow/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function OutputNode({ data }) {
  const [showSitePreview, setShowSitePreview] = useState(false);
  const [activePreview, setActivePreview] = useState(null);

  return (
    <>
      <div className="bg-surface-dark rounded-xl shadow-xl border border-[#1e293b] w-80 text-text-body">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#4f46e5] border-surface-dark" />
        <div className="bg-[#1e293b] text-white px-4 py-2 rounded-t-xl font-medium flex justify-between items-center border-b border-[#334155]">
          <span>Generated Output</span>
          <span className="text-xs bg-[#0f172a] px-2 py-1 rounded text-gray-400 font-semibold tracking-wider">RESULT</span>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto flex flex-col gap-4">
          {data.descriptions ? (
            data.descriptions.options.map((opt, i) => (
              <div key={i} className="border border-[#1e293b] p-4 rounded-xl bg-[#0f172a]">
                <h4 className="font-bold text-sm text-white mb-2 leading-snug">{opt.headline}</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{opt.body}</p>
                
                <button 
                  onClick={() => {
                    setActivePreview(opt);
                    setShowSitePreview(true);
                  }}
                  className="w-full py-2 text-xs font-semibold bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white rounded-lg transition-colors"
                >
                  Preview Static Site
                </button>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 text-center py-8 italic">
              Awaiting generation...
            </div>
          )}
        </div>
      </div>

      {showSitePreview && activePreview && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8" onClick={() => setShowSitePreview(false)}>
          <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Mock Browser Header */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto bg-white px-4 py-1 rounded-md text-xs text-gray-500 font-mono shadow-sm border border-gray-200">
                my-store.com/product
              </div>
              <button 
                className="text-gray-500 hover:text-gray-800 ml-auto font-bold"
                onClick={() => setShowSitePreview(false)}
              >
                ✕
              </button>
            </div>

            {/* Mock Landing Page Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 text-gray-900">
              <header className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="font-black text-2xl tracking-tighter">BRAND.</div>
                <div className="flex gap-8 text-sm font-semibold text-gray-600">
                  <span className="hover:text-black cursor-pointer">Shop</span>
                  <span className="hover:text-black cursor-pointer">About</span>
                  <span className="hover:text-black cursor-pointer">Cart (0)</span>
                </div>
              </header>
              <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-16 items-center">
                <div className="w-full md:w-1/2 bg-gray-200 aspect-square rounded-3xl flex items-center justify-center text-gray-400 text-lg border border-gray-300 shadow-inner">
                  Product Image Placeholder
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-start">
                  <span className="text-xs text-indigo-600 font-black uppercase tracking-[0.2em] mb-4">New Arrival</span>
                  <h1 className="text-5xl font-black leading-tight mb-6 text-gray-900">{activePreview.headline}</h1>
                  <p className="text-lg text-gray-500 leading-relaxed mb-10">{activePreview.body}</p>
                  <button className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30">
                    {activePreview.cta || 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
