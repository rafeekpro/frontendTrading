import { useState } from 'react';

export function APISettings() {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    // Mock save functionality
    console.log('Saving API settings:', { provider, apiKey });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold mb-4">API Connections</h3>

      <div className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium mb-2">
            Provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        {/* API Key Input */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-600">
            Your API key will be stored securely and never shared.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
