import { App } from 'obsidian';
import { Question, Answer } from './types';
import { IndexIntegrator } from './indexIntegrator';
import { UnifiedQuestionModal } from './unifiedQuestionModal';
import type UnifiedQuestionHandlerPlugin from '../main';

export interface UnifiedQuestionHandlerAPI {
  readonly apiVersion: string;
  getAPIVersion(): string;
  askQuestions(questions: Question[]): Promise<Record<string, Answer> | null>;
  askDynamicQuestions(
    initialQuestions: Question[],
    generateFollowUpQuestions: (answers: Record<string, Answer>) => Promise<Question[]>
  ): Promise<Record<string, Answer> | null>;
  readIndexFile(path: string): Promise<string[]>;
  appendToIndexFile(path: string, entry: string): Promise<boolean>;
}

export class UnifiedQuestionHandlerAPIImpl implements UnifiedQuestionHandlerAPI {
  readonly apiVersion: string = '1.0.0';
  private indexIntegrator: IndexIntegrator;
  plugin: UnifiedQuestionHandlerPlugin;

  constructor(private app: App) {
    this.indexIntegrator = new IndexIntegrator(app);
  }

  getAPIVersion(): string {
    return this.apiVersion;
  }

  async askQuestions(questions: Question[]): Promise<Record<string, Answer> | null> {
    const modal = new UnifiedQuestionModal(this.app, questions);
    return await modal.open();
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
    return await this.indexIntegrator.appendToIndexFile(path, entry);
  }
}
