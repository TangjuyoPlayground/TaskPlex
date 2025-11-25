import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Construction, ArrowLeft, Star } from 'lucide-react';
import { getModuleById } from '../config/modules';
import { getIcon } from '../config/icons';

/**
 * Generic placeholder screen for modules under development
 * Displays module info and "Coming Soon" message
 */
export const PlaceholderScreen: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { t } = useTranslation();

  // Get module info from registry
  const module = moduleId ? getModuleById(moduleId) : undefined;

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <Construction size={64} className="text-gray-400 dark:text-gray-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('placeholder.moduleNotFound')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('placeholder.moduleNotFoundDesc')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            {t('placeholder.backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = getIcon(module.icon);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 dark:from-purple-900/20 via-white dark:via-gray-900 to-blue-50 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                {React.createElement(IconComponent, { size: 40 })}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {t(module.labelKey)}
              </h1>
              <p className="text-purple-100 text-lg">
                {t(module.descriptionKey)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
              <Construction size={32} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('placeholder.comingSoon')}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {t('placeholder.comingSoonDesc')}
            </p>

            {/* Features List */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                {t('placeholder.plannedFeatures')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Star size={16} className="text-purple-500 dark:text-purple-400" />
                  {t('placeholder.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <Star size={16} className="text-purple-500 dark:text-purple-400" />
                  {t('placeholder.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <Star size={16} className="text-purple-500 dark:text-purple-400" />
                  {t('placeholder.feature3')}
                </li>
              </ul>
            </div>

            {/* Call to action */}
            <div className="flex gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <ArrowLeft size={20} />
                {t('placeholder.backToDashboard')}
              </Link>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 {t('placeholder.helpText')}
          </p>
        </div>
      </div>
    </div>
  );
};
