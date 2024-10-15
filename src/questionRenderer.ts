import { Question, Answer, TpSuggesterQuestion, IndexedManualQuestion, CheckboxQuestion, MultiSelectQuestion, FuzzySuggesterQuestion } from './types';
import { IndexIntegrator } from './indexIntegrator';
import { App, FuzzySuggestModal } from 'obsidian';
import { NewEntryModal } from './newEntryModal';
import { FuzzySuggester } from './fuzzySuggester';

export class QuestionRenderer {
  constructor(private indexIntegrator: IndexIntegrator, private app: App) {}

  async render(question: Question, existingAnswer?: Answer, onAnswerChange?: (answerId: string, value: Answer) => void): Promise<HTMLElement> {
    console.log(`Rendering question: ${question.answerId}, type: ${question.type}`);
    const container = document.createElement('div');
    container.addClass('question-container');

    const prompt = container.createEl('p', { text: question.prompt });

    switch (question.type) {
      case 'inputPrompt':
        this.renderInputPrompt(container, question, existingAnswer as string | undefined, onAnswerChange);
        break;
      case 'tpsuggester':
        await this.renderTpSuggester(container, question as TpSuggesterQuestion, existingAnswer as string | undefined, onAnswerChange);
        break;
      case 'indexedManual':
        await this.renderIndexedManual(container, question as IndexedManualQuestion, existingAnswer as string | undefined, onAnswerChange);
        break;
      case 'checkbox':
        this.renderCheckbox(container, question as CheckboxQuestion, existingAnswer as boolean | undefined, onAnswerChange);
        break;
      case 'multiSelect':
        await this.renderMultiSelect(container, question as MultiSelectQuestion, existingAnswers: string[] = [], onAnswerChange);
        break;
      case 'fuzzySuggester':
        await this.renderFuzzySuggester(container, question as FuzzySuggesterQuestion, existingAnswer as string | undefined, onAnswerChange);
        break;
      default:
        console.error(`Unsupported question type: ${(question as Question).type}`);
    }

    return container;
  }

  private renderInputPrompt(container: HTMLElement, question: Question, existingAnswer?: string, onAnswerChange?: (answerId: string, value: string) => void) {
    const input = container.createEl('input', {
      type: 'text',
      value: existingAnswer || question.defaultValue as string || '',
      placeholder: 'Enter your answer'
    });
    input.id = question.answerId;
    input.addEventListener('input', (e) => {
      onAnswerChange?.(question.answerId, (e.target as HTMLInputElement).value);
    });
  }

  private async renderTpSuggester(container: HTMLElement, question: TpSuggesterQuestion, existingAnswer?: string, onAnswerChange?: (answerId: string, value: string) => void) {
    console.log(`Rendering tpsuggester for question: ${question.answerId}`);
    const button = container.createEl('button', { text: existingAnswer || question.defaultValue as string || 'Select' });
    button.id = question.answerId;

    button.addEventListener('click', async () => {
      console.log(`Suggester button clicked for question: ${question.answerId}`);
      let options: string[] = [];
      if (question.indexPath) {
        options = await this.indexIntegrator.selectFromIndexWithManualEntry(question.indexPath, question.prompt);
      } else if (question.options) {
        options = [...question.options];
      }

      if (question.allowNewEntry) {
        options.push("New Entry");
      }

      const suggester = new FuzzySuggesterModal(
        this.app,
        options,
        question.prompt,
        question.indexPath,
        this.indexIntegrator,
        question.allowNewEntry ?? false  // Use nullish coalescing operator here
      );
      
      const result = await suggester.openAndGetValue();
      
      console.log(`Suggester result for ${question.answerId}: ${result}`);
      if (result) {
        button.textContent = result;
        onAnswerChange?.(question.answerId, result);
        console.log(`Answer updated for ${question.answerId}: ${result}`);
      }
    });

    if (existingAnswer) {
      console.log(`Setting initial value for ${question.answerId}: ${existingAnswer}`);
      onAnswerChange?.(question.answerId, existingAnswer);
    }
  }

  private renderCheckbox(container: HTMLElement, question: CheckboxQuestion, existingAnswer?: boolean, onAnswerChange?: (answerId: string, value: boolean) => void) {
    const checkbox = container.createEl('input', { type: 'checkbox' });
    checkbox.id = question.answerId;
    checkbox.checked = existingAnswer ?? question.defaultValue ?? false;
    
    checkbox.addEventListener('change', (e) => {
      onAnswerChange?.(question.answerId, (e.target as HTMLInputElement).checked);
    });

    const label = container.createEl('label', { text: question.prompt });
    label.prepend(checkbox);

    // If there's an existing answer or default value, trigger the onAnswerChange
    if (existingAnswer !== undefined || question.defaultValue !== undefined) {
      onAnswerChange?.(question.answerId, checkbox.checked);
    }
  }

  private async renderIndexedManual(container: HTMLElement, question: IndexedManualQuestion, existingAnswer?: string, onAnswerChange?: (answerId: string, value: string) => void) {
    console.log(`Rendering indexedManual for question: ${question.answerId}`);
    let defaultValue = existingAnswer || '';

    if (question.defaultValue && question.indexPath) {
      const indexEntries = await this.indexIntegrator.readIndexFile(question.indexPath);
      const foundEntry = indexEntries.find(entry => entry.toLowerCase() === question.defaultValue.toLowerCase());
      if (foundEntry) {
        defaultValue = foundEntry;
      }
    }

    const button = container.createEl('button', { text: defaultValue || 'Select' });
    button.id = question.answerId;

    button.addEventListener('click', async () => {
      console.log(`IndexedManual button clicked for question: ${question.answerId}`);
      let options: string[] = [];
      if (question.indexPath) {
        options = await this.indexIntegrator.selectFromIndexWithManualEntry(question.indexPath, question.prompt);
      }

      if (question.allowNewEntry) {
        options.push("New Entry");
      }

      const suggester = new FuzzySuggesterModal(
        this.app,
        options,
        question.prompt,
        question.indexPath,
        this.indexIntegrator,
        question.allowNewEntry || false
      );
      
      const result = await suggester.openAndGetValue();
      
      console.log(`Suggester result for ${question.answerId}: ${result}`);
      if (result) {
        button.textContent = result;
        onAnswerChange?.(question.answerId, result);
        console.log(`Answer updated for ${question.answerId}: ${result}`);
      }
    });

    if (defaultValue) {
      console.log(`Setting initial value for ${question.answerId}: ${defaultValue}`);
      onAnswerChange?.(question.answerId, defaultValue);
    }
  }

  private async renderMultiSelect(container: HTMLElement, question: MultiSelectQuestion, existingAnswers: string[] = [], onAnswerChange?: (answerId: string, value: string[]) => void) {
    const selectedOptionsContainer = container.createEl('div', { cls: 'selected-options' });
    const addButton = container.createEl('button', { text: 'Add Another', cls: 'add-another-button' });

    const updateSelectedOptions = () => {
      selectedOptionsContainer.empty();
      existingAnswers.forEach((answer, index) => {
        const optionEl = selectedOptionsContainer.createEl('div', { cls: 'selected-option' });
        optionEl.createSpan({ text: answer });
        const removeButton = optionEl.createEl('span', { cls: 'remove-option', text: '×' });
        removeButton.addEventListener('click', () => {
          existingAnswers.splice(index, 1);
          updateSelectedOptions();
          onAnswerChange?.(question.answerId, existingAnswers);
        });
      });
    };

    addButton.addEventListener('click', async () => {
      let options: string[] = [];
      if (question.indexPath) {
        options = await this.indexIntegrator.selectFromIndexWithManualEntry(question.indexPath, question.prompt);
      } else if (question.options) {
        options = [...question.options];
      }

      if (question.allowNewEntry) {
        options.push("New Entry");
      }

      const suggester = new FuzzySuggesterModal(
        this.app,
        options,
        question.prompt,
        question.indexPath,
        this.indexIntegrator,
        question.allowNewEntry ?? false  // Use nullish coalescing operator here
      );

      const newAnswer = await suggester.openAndGetValue();
      if (newAnswer) {
        existingAnswers.push(newAnswer);
        updateSelectedOptions();
        onAnswerChange?.(question.answerId, existingAnswers);
      }
    });

    updateSelectedOptions();
  }

  private async renderFuzzySuggester(container: HTMLElement, question: FuzzySuggesterQuestion, existingAnswer?: string, onAnswerChange?: (answerId: string, value: string) => void) {
    console.log(`Rendering fuzzySuggester for question: ${question.answerId}`);
    const input = container.createEl('input', {
      type: 'text',
      value: existingAnswer || question.defaultValue || '',
      placeholder: 'Start typing to search...'
    });
    input.id = question.answerId;

    let options: string[] = [];
    if (question.indexPath) {
      options = await this.indexIntegrator.readIndexFile(question.indexPath);
    } else if (question.options) {
      options = [...question.options];
    }

    const fuzzySuggester = new FuzzySuggester(
      this.app,
      input,
      options,
      (item: string) => item,
      question.allowNewEntry,
      question.indexPath
    );

    fuzzySuggester.onSelect = (selectedItem: string) => {
      onAnswerChange?.(question.answerId, selectedItem);
    };

    input.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      onAnswerChange?.(question.answerId, value);
    });

    if (existingAnswer || question.defaultValue) {
      const initialValue = existingAnswer || question.defaultValue;
      console.log(`Setting initial value for ${question.answerId}: ${initialValue}`);
      onAnswerChange?.(question.answerId, initialValue as string);
      input.value = initialValue as string;
      fuzzySuggester.onInputChanged();
    }
  }
}

class FuzzySuggesterModal extends FuzzySuggestModal<string> {
  private resolvePromise: (value: string | null) => void;
  private rejectPromise: (reason?: Error) => void;
  private selectedItem: string | null = null;
  private isCancelled: boolean = false;
  private isResolved: boolean = false;
  private isInitialOpen: boolean = true;

  constructor(
    app: App,
    private options: string[],
    private promptText: string,
    private indexPath: string | undefined,
    private indexIntegrator: IndexIntegrator,
    private allowNewEntry: boolean
  ) {
    super(app);
    this.setPlaceholder(promptText);
  }

  getItems(): string[] {
    return this.options;
  }

  getItemText(item: string): string {
    return item;
  }

  async onChooseItem(item: string): Promise<void> {
    console.log(`Item chosen in FuzzySuggesterModal: ${item}`);
    if (item === "New Entry") {
      const newEntry = await this.promptForNewEntry();
      if (newEntry) {
        if (this.indexPath) {
          const added = await this.indexIntegrator.appendToIndexFile(this.indexPath, newEntry);
          if (added) {
            this.selectedItem = newEntry;
          } else {
            this.selectedItem = null;
          }
        } else {
          this.selectedItem = newEntry;
        }
      } else {
        this.selectedItem = null;
      }
    } else {
      this.selectedItem = item;
    }
    this.isResolved = true;
    this.close();
  }

  async openAndGetValue(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
      this.open();
    });
  }

  onOpen() {
    super.onOpen();
    this.isInitialOpen = true;
  }

  onClose(): void {
    if (this.isInitialOpen) {
      this.isInitialOpen = false;
      return;
    }
    
    console.log(`Modal closed. Selected item: ${this.selectedItem}`);
    if (!this.isResolved) {
      if (this.isCancelled) {
        this.resolvePromise(null);
      } else {
        // Do nothing, wait for item selection
        return;
      }
    } else {
      this.resolvePromise(this.selectedItem);
    }
    this.isResolved = true;
  }

  cancelSelection(): void {
    this.isCancelled = true;
    this.isResolved = true;
    this.close();
  }

  private async promptForNewEntry(): Promise<string | null> {
    const newEntryModal = new NewEntryModal(this.app, `Enter new entry for: ${this.promptText}`);
    return await newEntryModal.openAndGetValue();
  }
}
