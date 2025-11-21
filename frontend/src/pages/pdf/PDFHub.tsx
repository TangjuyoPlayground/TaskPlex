import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileStack, Scissors, Minimize2, Grid2X2, ArrowRight } from 'lucide-react';

const ToolCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  path 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  color: string; 
  path: string;
}) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(path)}
      className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all cursor-pointer flex flex-col items-start h-full"
    >
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-4 flex-grow">
        {description}
      </p>
      <div className="flex items-center text-sm font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
        Open Tool <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};

export const PDFHub: React.FC = () => {
  const tools = [
    {
      title: 'Merge PDF',
      description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
      icon: FileStack,
      color: 'bg-red-600',
      path: '/pdf/merge'
    },
    {
      title: 'Split PDF',
      description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
      icon: Scissors,
      color: 'bg-red-600',
      path: '/pdf/split'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce file size while optimizing for maximal PDF quality.',
      icon: Minimize2,
      color: 'bg-green-600', // Different color for variety
      path: '/pdf/compress'
    },
    {
      title: 'Organize PDF',
      description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document.',
      icon: Grid2X2,
      color: 'bg-purple-600', // Different color for variety
      path: '/pdf/reorganize'
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Every tool you need to work with PDFs
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          All the tools you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
};

