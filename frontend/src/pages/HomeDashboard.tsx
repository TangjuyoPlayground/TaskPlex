import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Image as ImageIcon, FileText, Regex, Ruler, 
  Minimize2, RefreshCw, FileImage
} from 'lucide-react';

// Categories for filtering
type Category = 'all' | 'media' | 'document' | 'developer' | 'utility';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string; // Tailwind text color class
  category: Category;
  path: string;
  isNew?: boolean;
}

const tools: Tool[] = [
  // Video Tools
  {
    id: 'video-tools',
    title: 'Video Tools',
    description: 'Compress, convert and process your video files with ease. Supports MP4, AVI, MKV and more.',
    icon: Video,
    color: 'text-purple-600',
    category: 'media',
    path: '/video'
  },
  // Image Tools
  {
    id: 'image-tools',
    title: 'Image Tools',
    description: 'Optimize your images. Compress JPG, PNG, WEBP or convert between formats instantly.',
    icon: ImageIcon,
    color: 'text-blue-600',
    category: 'media',
    path: '/image'
  },
  // PDF Tools
  {
    id: 'pdf-tools',
    title: 'PDF Tools',
    description: 'Complete PDF solution. Merge, split, compress, organize and manage your PDF documents.',
    icon: FileText,
    color: 'text-red-600',
    category: 'document',
    path: '/pdf'
  },
  // Developer Tools
  {
    id: 'regex-tester',
    title: 'Regex Tester',
    description: 'Test and debug your regular expressions in real-time with visual highlighting.',
    icon: Regex,
    color: 'text-yellow-600',
    category: 'developer',
    path: '/regex'
  },
  // Utilities
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    description: 'Convert between thousands of units. Length, weight, temperature, speed and more.',
    icon: Ruler,
    color: 'text-green-600',
    category: 'utility',
    path: '/units'
  },
  // Shortcuts (Direct links to specific popular actions)
  {
    id: 'compress-video',
    title: 'Compress Video',
    description: 'Quickly reduce video file size without losing quality.',
    icon: Minimize2,
    color: 'text-purple-500',
    category: 'media',
    path: '/video',
    isNew: true
  },
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    description: 'Rearrange, delete or rotate pages in your PDF files.',
    icon: RefreshCw,
    color: 'text-red-500',
    category: 'document',
    path: '/pdf/reorganize'
  },
  {
    id: 'convert-image',
    title: 'Convert Image',
    description: 'Transform images to PNG, JPG, WEBP formats in seconds.',
    icon: FileImage,
    color: 'text-blue-500',
    category: 'media',
    path: '/image'
  }
];

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'media', label: 'Media' },
  { id: 'document', label: 'Documents' },
  { id: 'developer', label: 'Developer' },
  { id: 'utility', label: 'Utilities' },
];

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="bg-[#f4f0f8] py-20 px-4 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Your Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">TaskPlex</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Every tool you need to be productive, in one place. 
          Process videos, images, PDFs and more. 100% Free and Open Source.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="group relative flex flex-col p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left h-full hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="mb-6 p-4 rounded-xl bg-gray-50 w-fit group-hover:bg-gray-100 transition-colors">
                <tool.icon size={40} className={`${tool.color} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {tool.description}
              </p>

              {/* New Badge */}
              {tool.isNew && (
                <span className="absolute top-6 right-6 px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};





