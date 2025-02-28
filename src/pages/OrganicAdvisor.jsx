import React, { useState } from 'react';
import { Plane as Plant, Sprout, Bug, AlignCenterVertical as Certificate, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateResponse } from '../services/geminiAdvisor';
import { GiLeadPipe, GiSprout } from "react-icons/gi";

const agents = [
  {
    id: 'crop',
    name: 'Organic Crop Advisor',
    icon: <Plant className="w-6 h-6" />,
    description: 'Recommends organic crop varieties and rotation strategies',
    prompt: 'Given the soil type, climate, and historical yield data, suggest optimal organic crops and rotation plan. Provide a concise, precise response with clear bullet points and formatting. Limit to 3-5 key recommendations.'
  },
  {
    id: 'soil',
    name: 'Soil Health Advisor',
    icon: <Sprout className="w-6 h-6" />,
    description: 'Evaluates soil conditions and suggests organic amendments',
    prompt: 'Analyze soil conditions and recommend organic improvement techniques. Format your response with clear sections for analysis and recommendations. Be concise and specific with actionable advice. Limit to 3-5 key points.'
  },
  {
    id: 'pest',
    name: 'Pest Management Advisor',
    icon: <Bug className="w-6 h-6" />,
    description: 'Suggests natural pest control methods',
    prompt: 'Recommend organic pest management strategies for current crop issues. Structure your response with clear headings, concise explanations, and specific actions. Provide precise application methods and quantities where relevant. Limit to 3-5 strategies.'
  },
  {
    id: 'cert',
    name: 'Certification Guide',
    icon: <Certificate className="w-6 h-6" />,
    description: 'Guides through organic certification process',
    prompt: 'Outline the organic certification process and requirements. Present information in a structured format with clear steps, timelines, and requirements. Be concise and specific, focusing on key certification criteria and common challenges. Use numbered lists for procedural steps.'
  }
];

function OrganicAdvisor() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle advisor selection with reset functionality
  const handleSelectAgent = (agent) => {
    // Only reset if selecting a different advisor
    if (selectedAgent?.id !== agent.id) {
      setSelectedAgent(agent);
      setQuery(''); // Clear the input field
      setResponse(''); // Clear any previous response
      setError(null); // Clear any errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgent || !query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const formatInstructions = `
        Format your response for clarity and precision:
        1. Begin with a brief 1-2 sentence summary of your recommendation
        2. Use markdown formatting (headers, lists, bold) to organize information
        3. Limit to 3-5 key recommendations or points
        4. Be specific with actionable advice, include quantities and methods where relevant
        5. Keep explanations concise, focusing on practical application
      `;
      
      const fullPrompt = `You are an ${selectedAgent.name}. ${selectedAgent.prompt}\n\nUser Query: ${query}\n\n${formatInstructions}`;
      const aiResponse = await generateResponse(fullPrompt);
      setResponse(aiResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (markdownText) => {
    // If there's no response yet, return empty
    if (!markdownText) return '';
    
    // Clean up the response to ensure consistent formatting
    return markdownText
      // Ensure headers have space after # for proper rendering
      .replace(/#+([^\s])/g, '# $1')
      // Ensure list items have space after markers for proper rendering
      .replace(/^-([^\s])/gm, '- $1')
      .replace(/^([0-9]+)\.([^\s])/gm, '$1. $2');
  };

  return (
    <div className="min-h-screen bg-white rounded-lg">
      <header className="bg-green-700 shadow-md rounded-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex items-center space-x-3">
          <GiSprout className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Organic Farming Advisor</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">Select an Advisor</h2>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    className={`w-full text-left px-4 py-4 rounded-lg flex items-center space-x-3 transition-colors border ${
                      selectedAgent?.id === agent.id
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <span className={`${selectedAgent?.id === agent.id ? 'text-green-600' : 'text-gray-500'}`}>
                      {agent.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
              {selectedAgent ? (
                <>
                  <h2 className="text-xl font-semibold mb-6 flex items-center border-b pb-3 text-gray-800">
                    <span className="text-green-600 mr-3">{selectedAgent.icon}</span>
                    {selectedAgent.name}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                        What would you like to know?
                      </label>
                      <textarea
                        id="query"
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="Be specific about your needs for more precise recommendations"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          loading
                            ? 'bg-green-400 cursor-not-allowed'
                            : 'bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        }`}
                      >
                        {loading ? 'Generating Advice...' : 'Get Expert Advice'}
                      </button>
                      
                      {(query || response) && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('');
                            setResponse('');
                            setError(null);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </form>
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-md border border-red-100">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}
                  {response && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">Expert Recommendations</h3>
                      <div className="bg-gray-50 rounded-lg p-5 prose prose-green max-w-none border border-gray-100">
                        <ReactMarkdown>{formatMarkdown(response)}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
                    <GiSprout className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Welcome to Organic Farming Advisor</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Select an advisor from the panel to get personalized recommendations 
                    for your organic farming operation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrganicAdvisor;