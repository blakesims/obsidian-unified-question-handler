import { Plugin } from 'obsidian';
import { UnifiedQuestionModal } from './src/unifiedQuestionModal';
import { Question, Answer } from './src/types';
import { IndexIntegrator } from './src/indexIntegrator';
import { UnifiedQuestionHandlerAPIImpl } from './src/api';

export default class UnifiedQuestionHandlerPlugin extends Plugin {
  private api: UnifiedQuestionHandlerAPIImpl;

  async onload() {
    console.log('Loading Unified Question Handler plugin');

    this.api = new UnifiedQuestionHandlerAPIImpl(this.app);
    
    // Expose both the plugin instance and the API
    (this.app as any).plugins.plugins['obsidian-unified-question-handler'] = this;
    this.api.plugin = this;

    console.log('Unified Question Handler plugin loaded');

    // Add a command to test the API
    this.addCommand({
      id: 'test-unified-question-handler',
      name: 'Test Unified Question Handler',
      callback: () => {
        console.log('Running Unified Question Handler test...');
        this.testUnifiedQuestionHandler();
      },
    });

    this.addCommand({
      id: 'test-create-tutorial-note',
      name: 'Test Create Tutorial Note',
      callback: () => {
        console.log('Running Create Tutorial Note test...');
        this.createTutorialNote();
      },
    });
  }

  onunload() {
    console.log('Unloading Unified Question Handler plugin');
    delete (this.app as any).plugins.plugins['obsidian-unified-question-handler'];
  }

  // Expose the API for other plugins to use
  getAPI(): UnifiedQuestionHandlerAPIImpl {
    return this.api;
  }

  private testUnifiedQuestionHandler() {
    // Implement test logic here
  }

  private createTutorialNote() {
    // Implement tutorial note creation logic here
  }
}
