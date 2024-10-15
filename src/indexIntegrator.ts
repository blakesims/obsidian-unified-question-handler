import { App, Notice, TFile } from 'obsidian';
import { Answer, Question } from './types';

export class IndexIntegrator {
  private newlyAddedEntries: Set<string> = new Set();

  constructor(private app: App) {}

  async readIndexFile(path: string): Promise<string[]> {
    try {
      const indexFile = this.app.vault.getAbstractFileByPath(path);
      if (indexFile instanceof TFile) {
        const indexContent = await this.app.vault.read(indexFile);
        return indexContent
          .split("\n")
          .filter(line => line.trim() !== "")
          .map(line => line.trim());
      } else {
        new Notice(`Index file not found: ${path}`);
        return [];
      }
    } catch (error) {
      console.error(`Error reading index file: ${error}`);
      new Notice(`Error reading index file: ${path}`);
      return [];
    }
  }

  async appendToIndexFile(path: string, entry: string): Promise<boolean> {
    try {
      const indexFile = this.app.vault.getAbstractFileByPath(path);
      if (indexFile instanceof TFile) {
        const existingContent = await this.app.vault.read(indexFile);
        const entries = existingContent.split("\n").map(line => line.trim());
        if (!entries.includes(entry.trim())) {
          await this.app.vault.modify(indexFile, existingContent + "\n" + entry.trim());
          new Notice(`Added ${entry} to index file: ${path}`);
          this.newlyAddedEntries.add(entry.trim());
          return true;
        } else {
          new Notice(`Entry already exists in index file: ${path}`);
          return false;
        }
      } else {
        new Notice(`Index file not found: ${path}`);
        return false;
      }
    } catch (error) {
      console.error(`Error appending to index file: ${error}`);
      new Notice(`Error appending to index file: ${path}`);
      return false;
    }
  }

  async updateIndices(answers: Record<string, Answer>, questions: Question[]): Promise<void> {
    for (const question of questions) {
      if ((question.type === 'tpsuggester' || question.type === 'indexedManual' || question.type === 'multiSelect') && 'indexPath' in question && question.indexPath) {
        const answer = answers[question.answerId];
        if (Array.isArray(answer)) {
          for (const item of answer) {
            if (typeof item === 'string' && item.trim() !== '' && !this.newlyAddedEntries.has(item.trim())) {
              await this.appendToIndexFile(question.indexPath, item);
            }
          }
        } else if (typeof answer === 'string' && answer.trim() !== '' && !this.newlyAddedEntries.has(answer.trim())) {
          await this.appendToIndexFile(question.indexPath, answer);
        }
      }
    }
    // Clear the set after updating indices
    this.newlyAddedEntries.clear();
  }

  async selectFromIndexWithManualEntry(path: string, prompt: string): Promise<string[]> {
    let options = await this.readIndexFile(path);
    options.push("New Entry");
    return options;
  }
}
