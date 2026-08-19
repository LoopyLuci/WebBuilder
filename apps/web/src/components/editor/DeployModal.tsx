'use client';

import React, { useState } from 'react';
import { useEditorContext } from '@/editor';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const { state } = useEditorContext();
  const [target, setTarget] = useState<'vercel' | 'netlify' | 'cloudflare'>('vercel');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setDeployUrl(null);

    try {
      // Simulate deployment (in production, this would call the actual API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const urls = {
        vercel: `https://${state.sections.length > 0 ? 'my-project' : 'untitled'}.vercel.app`,
        netlify: `https://${state.sections.length > 0 ? 'my-project' : 'untitled'}.netlify.app`,
        cloudflare: `https://${state.sections.length > 0 ? 'my-project' : 'untitled'}.pages.dev`,
      };
      
      setDeployUrl(urls[target]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Deploy Project</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Deployment Target</label>
            <div className="grid grid-cols-3 gap-2">
              {(['vercel', 'netlify', 'cloudflare'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    target === t
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {t === 'vercel' ? '▲' : t === 'netlify' ? '◆': '☁'}
                  </div>
                  <span className="text-sm font-medium capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {target === 'vercel' && (
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <strong>Note:</strong> Set <code>VERCEL_TOKEN</code> environment variable for actual deployment.
            </div>
          )}
          {target === 'netlify' && (
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <strong>Note:</strong> Set <code>NETLIFY_TOKEN</code> environment variable for actual deployment.
            </div>
          )}
          {target === 'cloudflare' && (
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <strong>Note:</strong> Set <code>CF_API_TOKEN</code> environment variable for actual deployment.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {deployUrl && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm">
              <strong>Deployed!</strong> Your project is live at:{' '}
              <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {deployUrl}
              </a>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeployModal;
