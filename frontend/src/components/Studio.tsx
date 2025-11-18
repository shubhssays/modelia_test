import { useState, useEffect, useRef } from 'react';
import { ImageUpload } from './ImageUpload';
import { GenerationHistory } from './GenerationHistory';
import { useGenerate } from '../hooks/useGenerate';
import { useAuth } from '../hooks/useAuth';
import { generationService } from '../services/generation';
import { RETRY_CONFIG } from '../utils/constants';
import { getImageUrl } from '../utils/imageHelper';
import type { Generation, StyleOption } from '../types';

const STYLE_OPTIONS: StyleOption[] = ['casual', 'formal', 'vintage', 'modern', 'elegant'];

export function Studio() {
  const { logout, user } = useAuth();
  const hasFetchedHistory = useRef(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<StyleOption>('casual');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [history, setHistory] = useState<Generation[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);

  const loadHistory = async () => {
    try {
      const data = await generationService.getRecent(5);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const { generate, abort, retry, isLoading, error, retryCount, canRetry } = useGenerate({
    onSuccess: (data) => {
      const newGen: Generation = {
        id: data.id,
        prompt: data.prompt,
        style: data.style,
        imageUrl: data.imageUrl,
        status: data.status as Generation['status'],
        createdAt: data.createdAt,
      };
      setCurrentGeneration(newGen);
      
      // Add new generation to the beginning of history and keep only 5 items
      setHistory(prev => [newGen, ...prev].slice(0, 5));
      
      // Reset the form
      setPrompt('');
      setStyle('casual');
      setSelectedImage(null);
      setImagePreview('');
    },
  });

  useEffect(() => {
    if (hasFetchedHistory.current) return;
    hasFetchedHistory.current = true;
    
    const fetchHistory = async () => {
      await loadHistory();
    };
    
    fetchHistory();
  }, []);

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) {
      return;
    }

    await generate(prompt, style, selectedImage);
  };

  const handleRetry = async () => {
    if (!selectedImage || !prompt.trim() || !canRetry) {
      return;
    }

    await retry(prompt, style, selectedImage);
  };

  const handleRestoreGeneration = (gen: Generation) => {
    setCurrentGeneration(gen);
  };

  const canGenerate = selectedImage && prompt.trim() && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Studio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create Generation</h2>
              
              <div className="space-y-4">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  preview={imagePreview}
                  disabled={isLoading}
                />

                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    id="prompt"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe the style transformation..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                    aria-label="Generation prompt"
                  />
                </div>

                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value as StyleOption)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    aria-label="Select style"
                  >
                    {STYLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error.message}
                        </h3>
                        {canRetry && (
                          <p className="mt-2 text-sm text-red-700">
                            Retry attempt {retryCount} of {RETRY_CONFIG.MAX_ATTEMPTS}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Generate image"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate'
                    )}
                  </button>

                  {isLoading && (
                    <button
                      onClick={abort}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      aria-label="Abort generation"
                    >
                      Abort
                    </button>
                  )}

                  {canRetry && !isLoading && (
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      aria-label="Retry generation"
                    >
                      Retry ({RETRY_CONFIG.MAX_ATTEMPTS - retryCount} left)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {currentGeneration && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Current Generation</h2>
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={getImageUrl(currentGeneration.imageUrl)}
                    alt={currentGeneration.prompt}
                    className="rounded-lg object-cover w-full"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{currentGeneration.prompt}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Style: {currentGeneration.style} • {new Date(currentGeneration.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <GenerationHistory
              generations={history}
              onRestore={handleRestoreGeneration}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
