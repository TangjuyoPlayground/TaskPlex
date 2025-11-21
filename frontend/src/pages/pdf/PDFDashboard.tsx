import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minimize2, Merge, Split, RefreshCw, ArrowRight } from 'lucide-react';

const tools = [
  {
    id: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    icon: Minimize2,
    color: 'bg-green-50 text-green-600',
    hover: 'hover:border-green-200 hover:shadow-green-100'
  },
  {
    id: 'merge',
    title: 'Merge PDF',
    description: 'Combine PDFs in the order you want with the easiest PDF merger.',
    icon: Merge,
    color: 'bg-red-50 text-red-600',
    hover: 'hover:border-red-200 hover:shadow-red-100'
  },
  {
    id: 'split',
    title: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: Split,
    color: 'bg-blue-50 text-blue-600',
    hover: 'hover:border-blue-200 hover:shadow-blue-100'
  },
  {
    id: 'reorganize',
    title: 'Organize PDF',
    description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at will.',
    icon: RefreshCw,
    color: 'bg-purple-50 text-purple-600',
    hover: 'hover:border-purple-200 hover:shadow-purple-100'
  },
];

export const PDFDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">PDF Tools</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Merge, split, compress, and organize your PDFs in just a few clicks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => navigate(tool.id)}
            className={`group flex flex-col items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg text-left ${tool.hover}`}
          >
            <div className={`p-3 rounded-lg mb-4 ${tool.color} transition-colors`}>
              <tool.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700">
              {tool.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
              {tool.description}
            </p>
            <div className="flex items-center text-sm font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
              Open Tool <ArrowRight size={16} className="ml-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
