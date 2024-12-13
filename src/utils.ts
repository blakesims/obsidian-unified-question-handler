import { App } from 'obsidian';
import { UnifiedQuestionHandlerAPI } from './api';

interface UnifiedQuestionHandlerPlugin {
  api: UnifiedQuestionHandlerAPI;
}

export function getUnifiedQuestionHandlerAPI(app: App): UnifiedQuestionHandlerAPI {
  const plugin = ((app as any).plugins.plugins['unified-question-handler']) as UnifiedQuestionHandlerPlugin;
  if (!plugin || !plugin.api) {
    throw new Error('Unified Question Handler plugin is not installed or enabled');
  }
  
  // Add version check
  if (!plugin.api.getAPIVersion || plugin.api.getAPIVersion() < '1.0.0') {
    throw new Error('Incompatible Unified Question Handler API version');
  }
  
  return plugin.api;
}
