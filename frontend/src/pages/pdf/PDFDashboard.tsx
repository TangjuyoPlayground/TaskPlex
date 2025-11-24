import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minimize2, Merge, Split, RefreshCw, ArrowRight } from 'lucide-react';

const getTools = (t: (key: string) => string) => [
  {
    id: 'compress',
    title: t('pdf.tools.compress'),
    description: t('pdf.tools.compressDesc'),
    icon: Minimize2,
    color: 'bg-green-50 text-green-600',
    hover: 'hover:border-green-200 hover:shadow-green-100'
  },
  {
    id: 'merge',
    title: t('pdf.tools.merge'),
    description: t('pdf.tools.mergeDesc'),
    icon: Merge,
    color: 'bg-red-50 text-red-600',
    hover: 'hover:border-red-200 hover:shadow-red-100'
  },
  {
    id: 'split',
    title: t('pdf.tools.split'),
    description: t('pdf.tools.splitDesc'),
    icon: Split,
    color: 'bg-blue-50 text-blue-600',
    hover: 'hover:border-blue-200 hover:shadow-blue-100'
  },
  {
    id: 'reorganize',
    title: t('pdf.tools.organize'),
    description: t('pdf.tools.organizeDesc'),
    icon: RefreshCw,
    color: 'bg-purple-50 text-purple-600',
    hover: 'hover:border-purple-200 hover:shadow-purple-100'
  },
];

export const PDFDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tools = getTools(t);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('pdf.title')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('pdf.subtitle')}
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
              {t('pdf.tools.openTool')} <ArrowRight size={16} className="ml-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
