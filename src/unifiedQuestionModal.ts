import { App, Modal } from 'obsidian';
import { Question, Answer } from './types';
import { QuestionRenderer } from './questionRenderer';
import { IndexIntegrator } from './indexIntegrator';

export class UnifiedQuestionModal extends Modal {
  private answers: Record<string, Answer> = {};
  private questionRenderer: QuestionRenderer;
  private indexIntegrator: IndexIntegrator;
  private resolvePromise: (value: Record<string, Answer> | null) => void;
  private isSubmitted: boolean = false;

  constructor(app: App, private questions: Question[]) {
    super(app);
    this.indexIntegrator = new IndexIntegrator(app);
    this.questionRenderer = new QuestionRenderer(this.indexIntegrator, app);
    
    // Initialize answers with default values
    this.questions.forEach(question => {
      if (question.defaultValue !== undefined) {
        this.answers[question.answerId] = question.defaultValue;
      }
    });
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('unified-question-modal');
    contentEl.createEl('h2', { text: 'Answer Questions' });

    const questionsContainer = contentEl.createEl('div', { cls: 'questions-container' });

    this.questions.forEach(async (question) => {
      const questionEl = await this.questionRenderer.render(
        question,
        this.answers[question.answerId],
        this.handleAnswerChange.bind(this)
      );
      questionsContainer.appendChild(questionEl);
    });

    const submitButton = contentEl.createEl('button', { text: 'Submit', cls: 'submit-button' });
    submitButton.addEventListener('click', this.handleSubmit.bind(this));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    if (!this.isSubmitted) {
      this.resolvePromise(null);
    }
  }

  private handleAnswerChange(answerId: string, value: Answer) {
    this.answers[answerId] = value;
  }

  private async handleSubmit() {
    await this.indexIntegrator.updateIndices(this.answers, this.questions);
    this.isSubmitted = true;
    this.close();
    this.resolvePromise(this.answers);
  }

  open(): Promise<Record<string, Answer> | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      super.open();
    });
  }
}
