import { Plugin, App } from 'obsidian';
import { UnifiedQuestionModal } from './src/unifiedQuestionModal';
import { Question, Answer } from './src/types';
import { IndexIntegrator } from './src/indexIntegrator';

export default class UnifiedQuestionHandlerPlugin extends Plugin {
  api: UnifiedQuestionHandlerAPI;

  async onload() {
    console.log('Loading Unified Question Handler plugin');

    this.api = new UnifiedQuestionHandlerAPI(this.app);
    // Add the API to the global window object for easy access from Templater scripts
    (window as any).unifiedQuestionHandler = this.api;

    console.log('Unified Question Handler API attached to window object');

    // Add a command to test the API
    this.addCommand({
      id: 'test-unified-question-handler',
      name: 'Test Unified Question Handler',
      callback: () => {
        console.log('Running Unified Question Handler test...');
        (window as any).testUnifiedQuestionHandler();
      },
    });

    this.addCommand({
      id: 'test-create-tutorial-note',
      name: 'Test Create Tutorial Note',
      callback: () => {
        console.log('Running Create Tutorial Note test...');
        (window as any).createTutorialNote();
      },
    });
  }

  onunload() {
    console.log('Unloading Unified Question Handler plugin');
    delete (window as any).unifiedQuestionHandler;
  }
}

export class UnifiedQuestionHandlerAPI {
  private indexIntegrator: IndexIntegrator;

  constructor(private app: App) {
    this.indexIntegrator = new IndexIntegrator(app);
  }

  async askQuestions(questions: Question[]): Promise<Record<string, Answer> | null> {
    console.log('Asking questions:', questions);
    const modal = new UnifiedQuestionModal(this.app, questions);
    const result = await modal.open();
    return result || null;
  }

  async askDynamicQuestions(
    initialQuestions: Question[],
    generateFollowUpQuestions: (answers: Record<string, Answer>) => Promise<Question[]>
  ): Promise<Record<string, Answer> | null> {
    let allAnswers: Record<string, Answer> = {};
    
    // Ask initial questions
    const initialAnswers = await this.askQuestions(initialQuestions);
    if (!initialAnswers) return null;
    Object.assign(allAnswers, initialAnswers);

    // Generate and ask follow-up questions
    const followUpQuestions = await generateFollowUpQuestions(allAnswers);
    const followUpAnswers = await this.askQuestions(followUpQuestions);
    if (!followUpAnswers) return null;
    Object.assign(allAnswers, followUpAnswers);

    return allAnswers;
  }

  async readIndexFile(path: string): Promise<string[]> {
    return await this.indexIntegrator.readIndexFile(path);
  }

  async appendToIndexFile(path: string, entry: string): Promise<boolean> {
    const indexIntegrator = new IndexIntegrator(this.app);
    return await indexIntegrator.appendToIndexFile(path, entry);
  }
}
