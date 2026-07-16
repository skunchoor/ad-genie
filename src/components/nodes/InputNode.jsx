import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function InputNode({ id, data }) {
  const [image, setImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { updateNodeData } = useReactFlow();

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImage(dataUrl);
        // Extract the base64 part to send to the API
        const base64 = dataUrl.split(',')[1] || null;
        updateNodeData(id, { image: base64 });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    updateNodeData(id, { image: null });
  };

  return (
    <>
      <div className="bg-surface-dark rounded-xl shadow-xl border border-[#1e293b] w-80 text-text-body">
        <div className="bg-[#1e293b] text-white px-4 py-2 rounded-t-xl font-medium flex justify-between items-center border-b border-[#334155]">
          <span>Product Input</span>
          <span className="text-xs bg-[#0f172a] px-2 py-1 rounded text-gray-400 font-semibold tracking-wider">SOURCE</span>
        </div>
        <div className="p-4 flex flex-col gap-4">
          
          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Product Image</label>
            {!image ? (
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#334155] cursor-pointer"
              />
            ) : (
              <div className="flex items-center gap-3">
                <img 
                  src={image} 
                  alt="Product thumbnail" 
                  className="w-16 h-16 object-cover rounded border border-[#1e293b] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowPopup(true)}
                />
                <button 
                  onClick={handleRemoveImage}
                  className="text-xs text-red-400 hover:text-red-300 underline font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Title</label>
            <input 
              type="text" 
              defaultValue={data.title} 
              className="w-full text-sm border border-[#1e293b] rounded p-2 bg-[#0f172a] text-white focus:outline-none focus:border-[#4f46e5] transition-colors" 
              placeholder="Enter product title..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Features</label>
            <textarea 
              className="w-full text-sm border border-[#1e293b] rounded p-2 bg-[#0f172a] text-white focus:outline-none focus:border-[#4f46e5] transition-colors h-24 resize-none" 
              defaultValue={data.features.join('\n')} 
              placeholder="List features..."
            />
          </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#4f46e5] border-surface-dark" />
      </div>

      {showPopup && image && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8" onClick={() => setShowPopup(false)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-4 -right-4 bg-[#1e293b] text-white rounded-full w-8 h-8 flex items-center justify-center border border-[#334155] hover:bg-[#334155]"
              onClick={() => setShowPopup(false)}
            >
              ×
            </button>
            <img src={image} alt="Product full size" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
