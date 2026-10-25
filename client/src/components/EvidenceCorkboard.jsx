import React, { useState, useRef } from 'react';
import { Pin, Plus, Trash2, Save, Check } from 'lucide-react';
import { caseApi } from '../api/caseApi.js';

export default function EvidenceCorkboard({ caseId, suspects = [], clues = [], initialBoardState }) {
  const [nodes, setNodes] = useState(() => {
    if (initialBoardState?.nodes?.length > 0) {
      return initialBoardState.nodes;
    }
    // Initialize default nodes from suspects and discovered clues
    const initial = [];
    suspects.forEach((s, idx) => {
      initial.push({
        id: `node_sus_${s.id}`,
        type: 'suspect',
        refId: s.id,
        x: 60,
        y: 60 + idx * 160,
        text: `${s.name} (${s.role})`
      });
    });
    clues.filter((c) => c.discovered).forEach((c, idx) => {
      initial.push({
        id: `node_clue_${c.id}`,
        type: 'clue',
        refId: c.id,
        x: 360,
        y: 60 + idx * 140,
        text: `${c.title}`
      });
    });
    return initial;
  });

  const [connections, setConnections] = useState(() => initialBoardState?.connections || []);
  const [selectedForConnect, setSelectedForConnect] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [savedStatus, setSavedStatus] = useState(false);
  const boardRef = useRef(null);

  // Mouse handlers for dragging cards around the corkboard
  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const newX = Math.max(10, Math.min(boardRect.width - 200, e.clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(boardRect.height - 120, e.clientY - dragOffset.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  // Add custom sticky note
  const addNote = () => {
    const newNote = {
      id: `node_note_${Date.now()}`,
      type: 'note',
      x: 200 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      text: 'Suspicious discrepancy...'
    };
    setNodes((prev) => [...prev, newNote]);
  };

  // Handle Red Yarn Connection
  const handleNodeClick = (id) => {
    if (!selectedForConnect) {
      setSelectedForConnect(id);
    } else if (selectedForConnect === id) {
      setSelectedForConnect(null);
    } else {
      // Create connection between selectedForConnect and id
      const exists = connections.some(
        (c) =>
          (c.fromNodeId === selectedForConnect && c.toNodeId === id) ||
          (c.fromNodeId === id && c.toNodeId === selectedForConnect)
      );
      if (!exists) {
        setConnections((prev) => [
          ...prev,
          { fromNodeId: selectedForConnect, toNodeId: id }
        ]);
      }
      setSelectedForConnect(null);
    }
  };

  const saveBoard = async () => {
    try {
      await caseApi.updateBoard(caseId, { nodes, connections });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
    } catch (err) {
      console.warn('Failed to save board:', err);
    }
  };

  // Helper to calculate line centers
  const getNodeCenter = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 95, y: node.y + 45 };
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-amber-950/60 shadow-2xl">
      {/* Corkboard Top Bar */}
      <div className="bg-[#1f1712] border-b border-amber-950/80 px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Pin className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="font-bold text-amber-300 text-sm tracking-wide">
            EVIDENCE CORKBOARD
          </span>
          <span className="text-[11px] text-amber-200/50 hidden sm:inline">
            • Drag cards, click two cards to tie Red Yarn
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={addNote}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs border border-amber-700/60 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Sticky Note</span>
          </button>

          <button
            onClick={saveBoard}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs transition-colors"
          >
            {savedStatus ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedStatus ? 'Pinned & Saved' : 'Save Board'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Corkboard Surface */}
      <div
        ref={boardRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 min-h-[550px] bg-corkboard overflow-hidden select-none cursor-crosshair p-4"
      >
        {/* SVG Red Yarn Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {connections.map((c, i) => {
            const start = getNodeCenter(c.fromNodeId);
            const end = getNodeCenter(c.toNodeId);
            return (
              <g key={i}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                />
                {/* Yarn Pin Heads */}
                <circle cx={start.x} cy={start.y} r="4" fill="#dc2626" />
                <circle cx={end.x} cy={end.y} r="4" fill="#dc2626" />
              </g>
            );
          })}
        </svg>

        {/* Draggable Cards */}
        {nodes.map((node) => {
          const isSelected = selectedForConnect === node.id;
          return (
            <div
              key={node.id}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={() => handleNodeClick(node.id)}
              className={`absolute w-48 p-3 rounded-xl shadow-2xl transition-shadow cursor-grab active:cursor-grabbing z-20 ${
                isSelected
                  ? 'ring-4 ring-red-500 scale-105'
                  : 'hover:ring-2 hover:ring-amber-400/50'
              } ${
                node.type === 'suspect'
                  ? 'bg-neutral-900 border border-neutral-700 text-neutral-100'
                  : node.type === 'clue'
                  ? 'bg-[#182030] border border-blue-900/60 text-blue-100'
                  : 'bg-amber-100 text-neutral-900 border border-amber-300'
              }`}
            >
              {/* Push Pin */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 border border-white shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
              </div>

              <div className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">
                {node.type}
              </div>

              {node.type === 'note' ? (
                <textarea
                  value={node.text}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes((prev) =>
                      prev.map((n) => (n.id === node.id ? { ...n, text: val } : n))
                    );
                  }}
                  className="w-full bg-transparent text-xs font-serif resize-none focus:outline-none text-neutral-900 font-medium"
                  rows={2}
                />
              ) : (
                <div className="text-xs font-bold line-clamp-2">{node.text}</div>
              )}

              <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] opacity-70">
                <span>{isSelected ? '🎯 Ready to connect' : 'Click to link'}</span>
                {node.type === 'note' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNodes((prev) => prev.filter((n) => n.id !== node.id));
                      setConnections((prev) =>
                        prev.filter(
                          (c) => c.fromNodeId !== node.id && c.toNodeId !== node.id
                        )
                      );
                    }}
                    className="hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
