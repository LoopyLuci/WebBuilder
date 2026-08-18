'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">WebBuilder</h1>
        <p className="text-xl text-gray-600 mb-8">
          Next-Generation Agentic Web Building Platform.
          Design, build, and deploy web pages with AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/editor"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Open Visual Editor
          </Link>
          <a
            href="#features"
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Learn More
          </a>
        </div>

        <div id="features" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold mb-2">Visual Editor</h3>
            <p className="text-gray-600 text-sm">Drag-and-drop components to build pages visually</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold mb-2">AI Powered</h3>
            <p className="text-gray-600 text-sm">Describe what you want and AI builds it for you</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold mb-1">One-Click Deploy</h3>
            <p className="text-gray-600 text-sm">Deploy to Vercel, Netlify, or Cloudflare instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
