import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';

import InputNode from './components/nodes/InputNode';
import GeneratorNode from './components/nodes/GeneratorNode';
import JudgeNode from './components/nodes/JudgeNode';
import OutputNode from './components/nodes/OutputNode';
import ExtensionModal from './components/ExtensionModal';

import { mockInputProduct, mockGeneratedDescriptions, mockJudgeEvaluation } from './mockData';

const nodeTypes = {
  inputNode: InputNode,
  generatorNode: GeneratorNode,
  judgeNode: JudgeNode,
  outputNode: OutputNode,
};

const initialNodes = [
  {
    id: 'input-1',
    type: 'inputNode',
    position: { x: 50, y: 150 },
    data: mockInputProduct,
  },
  {
    id: 'gen-1',
    type: 'generatorNode',
    position: { x: 450, y: 150 },
    data: { isRunning: false },
  },
  {
    id: 'judge-1',
    type: 'judgeNode',
    position: { x: 800, y: 50 },
    data: { evaluation: null },
  },
  {
    id: 'out-1',
    type: 'outputNode',
    position: { x: 800, y: 250 },
    data: { descriptions: null },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'input-1', target: 'gen-1', animated: true, style: { stroke: '#9ca3af', strokeWidth: 2 } },
  { id: 'e2-3', source: 'gen-1', target: 'judge-1', animated: true, style: { stroke: '#9ca3af', strokeWidth: 2 } },
  { id: 'e2-4', source: 'gen-1', target: 'out-1', animated: true, style: { stroke: '#9ca3af', strokeWidth: 2 } },
];

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#9ca3af', strokeWidth: 2 } }, eds)),
    []
  );

  const handleRunGeneration = useCallback(async () => {
    let inputData = null;

    // Set generator node to running and reset others
    setNodes((nds) => {
      const inputNode = nds.find(n => n.id === 'input-1');
      inputData = inputNode ? inputNode.data : {};
      
      return nds.map((n) => {
        if (n.id === 'gen-1') return { ...n, data: { ...n.data, isRunning: true } };
        if (n.id === 'out-1') return { ...n, data: { ...n.data, descriptions: null } };
        if (n.id === 'judge-1') return { ...n, data: { ...n.data, evaluation: null } };
        return n;
      });
    });

    if (!inputData) return;

    try {
      const { title, features, tone, keywords, image } = inputData;
      
      // Call Generation API
      const res = await fetch("https://ad-genie-three.vercel.app/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, features, tone, keywords, image: image || null })
      });
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data || !data.options) {
        throw new Error("Invalid response from API (missing options array)");
      }
      
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === 'gen-1') return { ...n, data: { ...n.data, isRunning: false } };
          if (n.id === 'out-1') return { ...n, data: { ...n.data, descriptions: data } };
          return n;
        })
      );

      // Call Judge API automatically on the first generated option
      if (data.options && data.options.length > 0) {
        const firstOption = data.options[0];
        const judgeRes = await fetch("https://ad-genie-three.vercel.app/api/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title, features, tone, keywords,
            generated_content: `Headline: ${firstOption.headline}\nBody: ${firstOption.body}\nCTA: ${firstOption.cta}`
          })
        });
        const judgeData = await judgeRes.json();
        
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === 'judge-1') return { ...n, data: { ...n.data, evaluation: judgeData } };
            return n;
          })
        );
      }
    } catch (error) {
      console.error("API Error:", error);
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === 'gen-1') return { ...n, data: { ...n.data, isRunning: false } };
          return n;
        })
      );
    }
  }, []);

  // Pass down the function to the generator node
  const nodesWithActions = nodes.map(node => {
    if (node.id === 'gen-1') {
      return {
        ...node,
        data: {
          ...node.data,
          onRun: handleRunGeneration
        }
      };
    }
    return node;
  });

  return (
    <div className="min-h-screen bg-bg-dark text-text-body font-sans flex flex-col w-screen h-screen">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#1e293b] bg-[#0b1220]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 font-mono font-semibold tracking-tight text-lg">
            <a href="https://skunchoor.github.io" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2" title="Back to AI Playground">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span className="text-sm">AI Playground</span>
            </a>
            <span className="text-[#1e293b]">/</span>
            <div className="text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2s.5 2 2 2-2 2-2 2-.5-2-2-2 2-2 2-2z"/>
                <path d="M6.5 13C4 13 2 14.5 2 16.5S4.5 19 6 19"/>
                <path d="M6 15c0-3 2.5-5 6-5s6 2 6 5c0 1.5-1 3-3 3H9c-2 0-3-1.5-3-3z"/>
                <path d="M9 18v1c0 1-1 2-2 2h10c-1 0-2-1-2-2v-1"/>
                <path d="M18 13c1.5 0 3.5-1 4.5-2-.5 2.5-2 3-4.5 3"/>
                <path d="M10 10v-1h4v1"/>
                <path d="M12 9V7"/>
              </svg>
              <span>AdGenie</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div>
          <button 
            onClick={() => setIsExtensionModalOpen(true)}
            className="bg-[#1e293b] hover:bg-[#2d3748] text-white text-sm font-medium py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
            </svg>
            Add to Browser
          </button>
        </div>
      </header>

      <ExtensionModal 
        isOpen={isExtensionModalOpen} 
        onClose={() => setIsExtensionModalOpen(false)} 
      />

      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-[#121a2b] p-4 rounded-xl shadow-lg border border-[#1e293b] max-w-sm">
          <h1 className="text-xl font-bold text-white tracking-tight">AdGenie Flow</h1>
          <p className="text-sm text-gray-400 mt-1">
            Visually build and orchestrate your product description generation pipeline. Click the <span className="font-bold text-[#4f46e5]">Generate Content</span> button on the LLM node.
          </p>
        </div>
        <ReactFlow
          nodes={nodesWithActions}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          className="bg-bg-dark"
        >
          <Background color="#1e293b" gap={16} />
          <Controls className="bg-[#121a2b] border-[#1e293b] fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
