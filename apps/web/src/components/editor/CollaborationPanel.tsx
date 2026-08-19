'use client';

import React, { useState, useEffect } from 'react';
import { useEditorContext } from '@/editor';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Collaborator {
  userId: string;
  name: string;
  color: string;
  avatar?: string;
  selectedSectionId: string | null;
  isActive: boolean;
}

export function CollaborationPanel({ isOpen, onClose }: CollaborationPanelProps) {
  const { state: editorState } = useEditorContext();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Simulate connection
    if (isOpen && !isConnected) {
      setTimeout(() => {
        setIsConnected(true);
        setCollaborators([
          {
            userId: 'user-1',
            name: 'You',
            color: '#3b82f6',
            selectedSectionId: null,
            isActive: true,
          },
        ]);
      }, 500);
    }
  }, [isOpen, isConnected]);

  const handleInvite = () => {
    // Simulate adding a collaborator
    const newCollaborator: Collaborator = {
      userId: `user-${collaborators.length + 1}`,
      name: userName || `User ${collaborators.length + 1}`,
      color: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][collaborators.length % 4],
      selectedSectionId: null,
      isActive: true,
    };
    setCollaborators([...collaborators, newCollaborator]);
    setUserName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Collaboration</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted" aria-label="Close">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {/* Collaborators List */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Collaborators ({collaborators.length})</h3>
          <div className="space-y-2">
            {collaborators.map(collab => (
              <div key={collab.userId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: collab.color }}
                >
                  {collab.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{collab.name}</span>
                  {collab.selectedSectionId && (
                    <p className="text-xs text-muted-foreground">
                      Editing section...
                    </p>
                  )}
                </div>
                {collab.isActive && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Invite Others</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
            />
            <button
              onClick={handleInvite}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Session Info */}
        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p><strong>Session ID:</strong> session-{Date.now().toString(36)}</p>
          <p><strong>Project:</strong> Untitled</p>
          <p><strong>Sections:</strong> {editorState.sections.length}</p>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => {
            setIsConnected(false);
            setCollaborators([]);
            onClose();
          }}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted"
        >
          Leave Session
        </button>
      </div>
    </div>
  );
}

export default CollaborationPanel;
