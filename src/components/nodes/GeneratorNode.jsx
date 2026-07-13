import { Handle, Position } from '@xyflow/react';

export default function GeneratorNode({ data }) {
  return (
    <div className="bg-surface-dark rounded-xl shadow-xl border border-[#1e293b] w-72 text-text-body">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#4f46e5] border-surface-dark" />
      <div className="bg-[#1e293b] text-white px-4 py-2 rounded-t-xl font-medium flex justify-between items-center border-b border-[#334155]">
        <span>LLM Generator</span>
        <span className="text-xs bg-[#0f172a] px-2 py-1 rounded text-gray-400 font-semibold tracking-wider">ACTION</span>
      </div>
      <div className="p-4 flex flex-col gap-4">
        
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tone</label>
          <select className="w-full text-sm border border-[#1e293b] rounded p-2 bg-[#0f172a] text-white focus:outline-none focus:border-[#4f46e5] transition-colors">
            <option>Professional</option>
            <option>Exciting & Bold</option>
            <option>Humorous</option>
            <option>Minimalist</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Target Audience</label>
          <select className="w-full text-sm border border-[#1e293b] rounded p-2 bg-[#0f172a] text-white focus:outline-none focus:border-[#4f46e5] transition-colors">
            <option>General Consumers</option>
            <option>Tech Enthusiasts</option>
            <option>Professionals</option>
            <option>Youth / Gen Z</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Output Length</label>
          <select className="w-full text-sm border border-[#1e293b] rounded p-2 bg-[#0f172a] text-white focus:outline-none focus:border-[#4f46e5] transition-colors">
            <option>Short (Twitter/IG)</option>
            <option>Medium (Amazon Bullet Points)</option>
            <option>Long (Website Description)</option>
          </select>
        </div>

        <button 
          onClick={data.onRun}
          className="w-full py-2.5 mt-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          {data.isRunning ? 'Generating...' : 'Generate Content'}
        </button>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#4f46e5] border-surface-dark" />
    </div>
  );
}
