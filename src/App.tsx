import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faTrash, faClock } from '@fortawesome/free-solid-svg-icons';

interface Snippet {
  id: string;
  content: string;
  expiration: string;
  createdAt: Date;
}

const App: React.FC = () => {
  const [snippetName, setSnippetName] = useState('');
  const [snippetContent, setSnippetContent] = useState('');
  const [expiration, setExpiration] = useState('view');
  const [createdSnippet, setCreatedSnippet] = useState<Snippet | null>(null);
  const [copied, setCopied] = useState(false);

  const expirationOptions = [
    { value: 'view', label: 'Destroy when viewed' },
    { value: '10min', label: 'Destroy in 10 minutes' },
    { value: '1hour', label: 'Destroy in 1 Hour' },
    { value: '1day', label: 'Destroy in 1 Day' },
    { value: '1week', label: 'Destroy in 1 Week' },
    { value: '1month', label: 'Destroy in 1 Month' },
  ];

  const handleCreateSnippet = async () => {
    if (!snippetName || !snippetContent) return;

    const snippet: Snippet = {
      id: snippetName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      content: snippetContent,
      expiration,
      createdAt: new Date(),
    };

    // TODO: Implement Cloudflare KV storage
    setCreatedSnippet(snippet);
  };

  const copyToClipboard = async () => {
    if (!createdSnippet) return;
    
    const url = `snip.goodheart.tech/${createdSnippet.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container">
      <h1 className="text-4xl font-bold text-uranian mb-2 text-center">
        Snippet Share
      </h1>
      <p className="text-gray-400 text-center mb-8">
        Share your code snippets securely with automatic expiration
      </p>

      {!createdSnippet ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Snippet Name
            </label>
            <div className="flex gap-2">
              <span className="input-field flex items-center">
                snip.goodheart.tech/
              </span>
              <input
                type="text"
                className="input-field flex-1"
                value={snippetName}
                onChange={(e) => setSnippetName(e.target.value)}
                placeholder="Enter snippet name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Snippet Content
            </label>
            <textarea
              className="input-field w-full h-64"
              value={snippetContent}
              onChange={(e) => setSnippetContent(e.target.value)}
              placeholder="Paste your snippet here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Expiration
            </label>
            <select
              className="input-field w-full"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            >
              {expirationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary w-full"
            onClick={handleCreateSnippet}
          >
            Create Snippet
          </button>
        </div>
      ) : (
        <div className="bg-charcoal p-6 rounded-lg space-y-4">
          <h2 className="text-2xl font-semibold text-uranian">
            Your Snippet is Ready!
          </h2>
          <div className="flex items-center gap-2 bg-rich-black p-3 rounded">
            <span className="flex-1">
              snip.goodheart.tech/{createdSnippet.id}
            </span>
            <button
              className="btn-primary px-4"
              onClick={copyToClipboard}
            >
              <FontAwesomeIcon icon={faCopy} className="mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FontAwesomeIcon icon={faClock} />
            <span>
              Expires: {expirationOptions.find(opt => opt.value === createdSnippet.expiration)?.label}
            </span>
          </div>
          <button
            className="btn-primary w-full bg-red-600 hover:bg-red-700"
            onClick={() => setCreatedSnippet(null)}
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Create New Snippet
          </button>
        </div>
      )}
    </div>
  );
};

export default App; 