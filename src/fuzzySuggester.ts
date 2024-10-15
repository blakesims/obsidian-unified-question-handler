import { App, ISuggestOwner, Scope } from 'obsidian';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';
import { IndexIntegrator } from './indexIntegrator';
import { NewEntryModal } from './newEntryModal';
import * as Fuzzysort from 'fuzzysort';

class Suggest<T> {
    private owner: ISuggestOwner<T>;
    private values: T[];
    private suggestions: HTMLDivElement[];
    private selectedItem: number;
    private containerEl: HTMLElement;

    constructor(owner: ISuggestOwner<T>, containerEl: HTMLElement, scope: Scope) {
        this.owner = owner;
        this.containerEl = containerEl;

        containerEl.on("click", ".suggestion-item", this.onSuggestionClick.bind(this));
        containerEl.on("mousemove", ".suggestion-item", this.onSuggestionMouseover.bind(this));

        scope.register([], "ArrowUp", (event) => {
            if (!event.isComposing) {
                this.setSelectedItem(this.selectedItem - 1, true);
                return false;
            }
        });

        scope.register([], "ArrowDown", (event) => {
            if (!event.isComposing) {
                this.setSelectedItem(this.selectedItem + 1, true);
                return false;
            }
        });

        scope.register([], "Enter", (event) => {
            if (!event.isComposing) {
                this.useSelectedItem(event);
                return false;
            }
        });
    }

    onSuggestionClick(event: MouseEvent, el: HTMLDivElement): void {
        event.preventDefault();
        const item = this.suggestions.indexOf(el);
        this.setSelectedItem(item, false);
        this.useSelectedItem(event);
    }

    onSuggestionMouseover(_event: MouseEvent, el: HTMLDivElement): void {
        const item = this.suggestions.indexOf(el);
        this.setSelectedItem(item, false);
    }

    setSuggestions(values: T[]) {
        this.containerEl.empty();
        const suggestionEls: HTMLDivElement[] = [];

        values.forEach((value) => {
            const suggestionEl = this.containerEl.createDiv("suggestion-item");
            this.owner.renderSuggestion(value, suggestionEl);
            suggestionEls.push(suggestionEl);
        });

        this.values = values;
        this.suggestions = suggestionEls;
        this.setSelectedItem(0, false);
    }

    useSelectedItem(event: MouseEvent | KeyboardEvent) {
        const currentValue = this.values[this.selectedItem];
        if (currentValue) {
            this.owner.selectSuggestion(currentValue, event);
        }
    }

    setSelectedItem(selectedIndex: number, scrollIntoView: boolean) {
        const normalizedIndex = wrapAround(selectedIndex, this.suggestions.length);
        const prevSelectedSuggestion = this.suggestions[this.selectedItem];
        const selectedSuggestion = this.suggestions[normalizedIndex];

        prevSelectedSuggestion?.removeClass("is-selected");
        selectedSuggestion?.addClass("is-selected");

        this.selectedItem = normalizedIndex;

        if (scrollIntoView) {
            selectedSuggestion.scrollIntoView(false);
        }
    }
}

export class FuzzySuggester<T> implements ISuggestOwner<T> {
    private inputEl: HTMLInputElement;
    private scope: Scope;
    private suggestEl: HTMLElement;
    private suggest: Suggest<T>;
    private popper: PopperInstance;
    private app: App;
    private indexIntegrator: IndexIntegrator;
    public onSelect: (item: T) => void;
    private currentInput: string = '';

    private fuzzySortOptions: Fuzzysort.Options = {
        threshold: -10000,
        limit: 50,
    };

    constructor(
        app: App,
        inputEl: HTMLInputElement,
        private items: T[],
        private getItemText: (item: T) => string,
        private allowNewEntry: boolean = false,
        private indexPath?: string
    ) {
        this.app = app;
        this.inputEl = inputEl;
        this.scope = new Scope();
        this.indexIntegrator = new IndexIntegrator(app);

        this.suggestEl = createDiv("suggestion-container");
        const suggestion = this.suggestEl.createDiv("suggestion");
        this.suggest = new Suggest(this, suggestion, this.scope);

        this.scope.register([], "Escape", this.close.bind(this));

        this.inputEl.addEventListener("input", this.onInputChanged.bind(this));
        this.inputEl.addEventListener("focus", this.onInputChanged.bind(this));
        this.inputEl.addEventListener("blur", this.close.bind(this));
        this.suggestEl.on("mousedown", ".suggestion-container", (event: MouseEvent) => {
            event.preventDefault();
        });
    }

    onInputChanged(): void {
        const inputStr = this.inputEl.value;
        const suggestions = this.getSuggestions(inputStr);

        if (suggestions.length > 0) {
            this.suggest.setSuggestions(suggestions);
            this.open(document.body, this.inputEl);
        } else {
            this.close();
        }
    }

    open(container: HTMLElement, inputEl: HTMLElement): void {
        this.app.keymap.pushScope(this.scope);

        container.appendChild(this.suggestEl);
        this.popper = createPopper(inputEl, this.suggestEl, {
            placement: "bottom-start",
            modifiers: [
                {
                    name: "sameWidth",
                    enabled: true,
                    fn: ({ state, instance }) => {
                        const targetWidth = `${state.rects.reference.width}px`;
                        if (state.styles.popper.width === targetWidth) {
                            return;
                        }
                        state.styles.popper.width = targetWidth;
                        instance.update();
                    },
                    phase: "beforeWrite",
                    requires: ["computeStyles"],
                },
            ],
        });
    }

    close(): void {
        this.app.keymap.popScope(this.scope);
        this.suggest.setSuggestions([]);
        if (this.popper) this.popper.destroy();
        this.suggestEl.detach();
    }

    getSuggestions(inputStr: string): T[] {
        this.currentInput = inputStr; // Store the current input
        const results = Fuzzysort.go(inputStr, this.items, {
            ...this.fuzzySortOptions,
            key: this.getItemText,
        });
        const suggestions = results.map(result => result.obj as T);
        
        // Add "New Entry" only if there are no matches, allowNewEntry is true, and the input is not empty
        if (suggestions.length === 0 && this.allowNewEntry && inputStr.trim() !== '') {
            suggestions.push("New Entry" as unknown as T);
        }
        
        return suggestions;
    }

    renderSuggestion(item: T, el: HTMLElement): void {
        const itemText = this.getItemText(item);
        const result = Fuzzysort.single(this.inputEl.value, itemText);
        if (result) {
            // The highlight method is on the result object, not on Fuzzysort
            const highlighted = result.highlight('<mark>', '</mark>');
            if (highlighted) {
                el.innerHTML = highlighted;
            } else {
                el.textContent = itemText;
            }
        } else {
            el.textContent = itemText;
        }
    }

    async selectSuggestion(item: T): Promise<void> {
        if (item === "New Entry" as unknown as T) {
            const newEntryModal = new NewEntryModal(this.app, "Enter new entry", this.currentInput);
            const newEntry = await newEntryModal.openAndGetValue();
            if (newEntry) {
                if (this.indexPath) {
                    this.indexIntegrator.markAsNewEntry(newEntry); // Mark as new entry
                    await this.indexIntegrator.appendToIndexFile(this.indexPath, newEntry);
                }
                this.items.push(newEntry as unknown as T);
                this.inputEl.value = newEntry;
                this.onSelect?.(newEntry as unknown as T);
            }
        } else {
            this.inputEl.value = this.getItemText(item);
            this.onSelect?.(item);
        }
        this.inputEl.trigger("input");
        this.close();
    }
}

function wrapAround(value: number, size: number): number {
    return ((value % size) + size) % size;
}
