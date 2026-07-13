import { Handle, Position } from '@xyflow/react';

export default function JudgeNode({ data }) {
  return (
    <div className="bg-surface-dark rounded-xl shadow-xl border border-[#1e293b] w-72 text-text-body">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#4f46e5] border-surface-dark" />
      <div className="bg-[#1e293b] text-white px-4 py-2 rounded-t-xl font-medium flex justify-between items-center border-b border-[#334155]">
        <span>LLM Judge</span>
        <span className="text-xs bg-[#0f172a] px-2 py-1 rounded text-gray-400 font-semibold tracking-wider">EVALUATION</span>
      </div>
      <div className="p-4">
        {data.evaluation ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-[#0f172a] border border-[#1e293b] px-3 py-2 rounded-lg">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</span>
              <span className={`text-xl font-black ${data.evaluation.score >= 8 ? 'text-green-400' : 'text-amber-400'}`}>
                {data.evaluation.score}/10
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {data.evaluation.feedback}
              </p>
            </div>
            {data.evaluation.safety_flag && (
              <div className="text-xs text-red-300 bg-red-900/40 p-2 rounded border border-red-800/50 font-semibold flex items-center gap-1.5">
                <span className="text-base">⚠️</span> Safety Flag Raised
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-6 italic">
            Waiting for output...
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#4f46e5] border-surface-dark" />
    </div>
  );
}
