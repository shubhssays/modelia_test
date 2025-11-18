import { getImageUrl } from '../utils/imageHelper';
import type { Generation } from '../types';

interface GenerationHistoryProps {
  generations: Generation[];
  onRestore: (generation: Generation) => void;
}

export function GenerationHistory({ generations, onRestore }: GenerationHistoryProps) {
  if (generations.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Generations</h2>
        <p className="text-sm text-gray-500 text-center py-8">No generations yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Recent Generations ({generations.length})
      </h2>
      <div className="space-y-4">
        {generations.map((gen) => (
          <div
            key={gen.id}
            onClick={() => onRestore(gen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRestore(gen);
              }
            }}
            className="cursor-pointer border border-gray-200 rounded-lg p-3 hover:border-indigo-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            role="button"
            tabIndex={0}
            aria-label={`Restore generation: ${gen.prompt}`}
          >
            <div className="aspect-w-16 aspect-h-9 mb-2">
              <img
                src={getImageUrl(gen.imageUrl)}
                alt={gen.prompt}
                className="rounded object-cover w-full h-32"
              />
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{gen.prompt}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500 capitalize">{gen.style}</span>
              <span className="text-xs text-gray-400">
                {new Date(gen.createdAt).toLocaleDateString()}
              </span>
            </div>
            {gen.status && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${
                  gen.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : gen.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {gen.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
