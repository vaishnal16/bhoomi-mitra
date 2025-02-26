import React, { useState } from 'react';
import { Loader2, Tractor, Truck, Warehouse, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { generateSupplyChainPlan } from '../services/geminiSCM';

const options = [
  {
    id: 'transport',
    label: 'Transport Options',
    icon: Truck,
    description: 'Get transportation recommendations and cost estimates'
  },
  {
    id: 'storage',
    label: 'Storage & Warehousing',
    icon: Warehouse,
    description: 'Find storage facilities and capacity information'
  },
  {
    id: 'market',
    label: 'Market Demand Analysis',
    icon: TrendingUp,
    description: 'Analyze market trends and selling strategies'
  },
  {
    id: 'cost',
    label: 'Cost Estimation',
    icon: DollarSign,
    description: 'Get comprehensive cost optimization insights'
  }
];

export default function SupplyChainForm() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [produceType, setProduceType] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleOptionToggle = (optionId) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!produceType || !location || selectedOptions.length === 0) {
      setError('Please fill in all fields and select at least one option');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const plan = await generateSupplyChainPlan(selectedOptions, produceType, location);
      setResult(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatResult = (text) => {
    // Clean up markdown-style formatting
    let cleanedText = text
      .replace(/\*\*/g, '') // Remove all double asterisks
      .replace(/\*/g, '');   // Remove all single asterisks
    
    // Split the text by double newlines to identify distinct sections
    const sections = cleanedText.split('\n\n').filter(section => section.trim());
    
    return sections.map((section) => {
      // Check if section contains table-like structure (rows with multiple | characters)
      if (section.includes('|') && section.split('\n').filter(line => line.includes('|')).length > 1) {
        const tableRows = section.split('\n').filter(row => row.trim());
        
        // Process table rows
        const processedRows = tableRows.map(row => {
          // Split by | and trim each cell
          return row.split('|').map(cell => cell.trim()).filter(cell => cell);
        });
        
        return {
          type: 'table',
          headers: processedRows[0] || [],
          rows: processedRows.slice(1) || []
        };
      }
      
      // Handle list items (bullet points and dashes)
      if (/^[•\-]\s/.test(section.trim()) || section.split('\n').some(line => /^[•\-]\s/.test(line.trim()))) {
        return {
          type: 'list',
          content: section.split('\n')
            .filter(item => item.trim())
            .map(item => item.replace(/^[•\-]\s*/, '').trim())
        };
      }
      
      // Handle sections with titles that use roman numerals (I., II., etc.)
      if (/^[IVX]+\.\s/.test(section.trim())) {
        const titleMatch = section.match(/^([IVX]+\.\s[^\n]+)([\s\S]*)/);
        
        if (titleMatch) {
          return {
            type: 'section',
            title: titleMatch[1].trim(),
            content: titleMatch[2].trim()
          };
        }
      }
      
      // Handle regular sections with titles (contains colon in the first line)
      const lines = section.split('\n');
      const firstLine = lines[0];
      
      if (firstLine.includes(':')) {
        const [title, ...contentParts] = firstLine.split(':');
        // Join the first line content back with the colon if there were any
        const firstLineContent = contentParts.join(':').trim();
        // Get the rest of the content from remaining lines
        const remainingContent = lines.slice(1).join('\n').trim();
        // Combine first line content with remaining content
        const fullContent = firstLineContent + (remainingContent ? ' ' + remainingContent : '');
        
        return {
          type: 'section',
          title: title.trim(),
          content: fullContent
        };
      }
      
      // Regular paragraphs
      return {
        type: 'paragraph',
        content: section.trim()
      };
    });
  };
  
  // This function is no longer used but left for reference
  const displayFormattedOutput = (formattedData) => {
    return formattedData.map(item => {
      switch (item.type) {
        case 'section':
          return `SECTION: ${item.title}\n${item.content}`;
        
        case 'paragraph':
          return `PARAGRAPH:\n${item.content}`;
        
        case 'list':
          return `LIST:\n${item.content.map(listItem => `• ${listItem}`).join('\n')}`;
        
        case 'table':
          const headerRow = `| ${item.headers.join(' | ')} |`;
          const separator = `| ${item.headers.map(() => '---').join(' | ')} |`;
          const dataRows = item.rows.map(row => `| ${row.join(' | ')} |`);
          
          return `TABLE:\n${headerRow}\n${separator}\n${dataRows.join('\n')}`;
        
        default:
          return JSON.stringify(item);
      }
    }).join('\n\n');
  };

  return (
    <div className="max-w-5xl mx-auto p-2 space-y-8">
      <div className="text-center bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold text-white mb-3">Agri Supply Chain Advisor</h1>
        <p className="text-lg text-white opacity-80 max-w-2xl mx-auto">
          Get detailed, data-driven supply chain recommendations tailored for your agricultural produce
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="produceType" className="block text-sm font-semibold text-gray-700">
                Produce Type
              </label>
              <input
                type="text"
                id="produceType"
                value={produceType}
                onChange={(e) => setProduceType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                placeholder="e.g., Wheat, Rice, Vegetables"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                placeholder="e.g., California, USA"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Select Supply Chain Components
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`relative flex items-start p-4 cursor-pointer rounded-xl border transition-all duration-200 ${
                      selectedOptions.includes(option.id)
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                    onClick={() => handleOptionToggle(option.id)}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                    <div className="ml-3 flex items-center">
                      <Icon className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <label className="font-medium text-gray-900">{option.label}</label>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-4 px-6 rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200 ${
              loading 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 hover:shadow'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Generating Plan...
              </>
            ) : (
              'Generate Supply Chain Plan'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Supply Chain Plan</h2>
          <div className="space-y-6">
            {formatResult(result).map((section, index) => {
              if (section.type === 'list') {
                return (
                  <ul key={index} className="list-disc pl-6 space-y-2">
                    {section.content.map((item, i) => (
                      <li key={i} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                );
              }
              if (section.type === 'section') {
                return (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-gray-700">{section.content}</p>
                  </div>
                );
              }
              return (
                <p key={index} className="text-gray-700">{section.content}</p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}