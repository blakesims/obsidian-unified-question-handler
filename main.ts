import { Plugin, App } from 'obsidian';
import { UnifiedQuestionModal } from './src/unifiedQuestionModal';
import { Question, Answer } from './src/types';
import { IndexIntegrator } from './src/indexIntegrator';
import { UnifiedQuestionHandlerAPIImpl } from './src/api';

export default class UnifiedQuestionHandlerPlugin extends Plugin {
  private api: UnifiedQuestionHandlerAPIImpl;

  async onload() {
    console.log('Loading Unified Question Handler plugin');

    this.api = new UnifiedQuestionHandlerAPIImpl(this.app);
    // Only expose the API through the plugin registry
    (this.app as any).plugins.plugins['unified-question-handler'] = {
      api: this.api
    };

    console.log('Unified Question Handler API attached to plugin registry');

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
    delete (this.app as any).plugins.plugins['unified-question-handler'];
  }

  private testUnifiedQuestionHandler() {
    // Implement test logic here
  }

  private createTutorialNote() {
    // Implement tutorial note creation logic here
  }
}
