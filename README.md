# Unified Question Handler for Obsidian

The Unified Question Handler is an Obsidian plugin that simplifies the process of gathering user input in your scripts and templates. It provides a unified interface for asking various types of questions and handling user responses.

## Features

- Single modal interface for multiple questions
- Support for various question types: input, checkbox, fuzzy search, multi-select, and more
- Integration with index files for dynamic options
- Easy to integrate with existing scripts

## Installation

1. Download the latest release from the GitHub repository.
2. Extract the zip file in your Obsidian vault's `.obsidian/plugins/` directory.
3. Enable the plugin in Obsidian's Community Plugins settings.

## Usage

The Unified Question Handler exposes an API through Obsidian's plugin registry. Here's how to access and use it:

```javascript
// Get the API from the plugin registry
const api = app.plugins.plugins['unified-question-handler'].api;

// Example usage
const questions = [
    {
        type: "inputPrompt",
        prompt: "What's your name?",
        answerId: "name"
    },
    {
        type: "checkbox",
        prompt: "Are you a student?",
        answerId: "isStudent"
    }
];

const answers = await api.askQuestions(questions);
if (answers) {
    console.log(`Name: ${answers.name}`);
    console.log(`Is student: ${answers.isStudent ? 'Yes' : 'No'}`);
}
```

### Type-Safe API Access

For better type safety and version checking, you can use the provided utility function:

```javascript
const { getUnifiedQuestionHandlerAPI } = require('unified-question-handler/utils');

try {
    const api = getUnifiedQuestionHandlerAPI(app);
    // Use the API as shown above
} catch (error) {
    console.error('Failed to access Unified Question Handler:', error);
}
```

## Question Types

The plugin supports various question types:

1. `inputPrompt`: Simple text input
2. `checkbox`: Yes/no questions
3. `fuzzySuggester`: Selection with fuzzy search
4. `multiSelect`: Multiple option selection
5. `indexedManual`: Selection from an index file with manual entry option

## Using Index Files

Index files allow you to maintain lists of options for your questions:

```javascript
const questions = [
    {
        type: "fuzzySuggester",
        prompt: "Select your favorite color:",
        answerId: "favoriteColor",
        indexPath: "Meta/Indices/Colors.md",
        allowNewEntry: true
    }
];
```

The index file (`Colors.md`) should contain a list of options:
```
Red
Blue
Green
Yellow
Purple
```

## API Version Information

The plugin includes version information to ensure compatibility:

```javascript
const api = getUnifiedQuestionHandlerAPI(app);
console.log(`API Version: ${api.getAPIVersion()}`);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
