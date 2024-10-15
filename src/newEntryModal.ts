import { App, Modal, Setting } from 'obsidian';

export class NewEntryModal extends Modal {
  private result: string | null = null;
  private resolvePromise: (value: string | null) => void;

  constructor(app: App, private prompt: string, private defaultValue: string = '') {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Add New Entry' });
    contentEl.createEl('p', { text: this.prompt });

    new Setting(contentEl)
      .setName('New Entry')
      .addText(text => text
        .setValue(this.defaultValue)
        .onChange(value => {
          this.result = value;
        }));

    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText('Confirm')
        .setCta()
        .onClick(() => {
          this.close();
          this.resolvePromise(this.result);
        }))
      .addButton(btn => btn
        .setButtonText('Cancel')
        .onClick(() => {
          this.close();
          this.resolvePromise(null);
        }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  async openAndGetValue(): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.open();
    });
  }
}
