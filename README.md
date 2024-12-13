# Unified Question Handler for Obsidian

The Unified Question Handler is an Obsidian plugin that simplifies the process of gathering user input in your scripts and templates. It provides a unified interface for asking various types of questions and handling user responses.

## Features

- Single modal interface for multiple questions
- Support for various question types: input, checkbox, fuzzy search, multi-select, and more
- Integration with index files for dynamic options
- Easy to integrate with existing Templater scripts

## Installation

1. Download the latest release from the GitHub repository.
2. Extract the zip file in your Obsidian vault's `.obsidian/plugins/` directory.
3. Enable the plugin in Obsidian's Community Plugins settings.

## Usage

The Unified Question Handler exposes an API that you can use in your scripts or other plugins. Here's a basic example:

```js
const api = window.unifiedQuestionHandler;
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
console.log(Name: ${answers.name});
console.log(Is student: ${answers.isStudent ? 'Yes' : 'No'});
}
```

## Comparison with Traditional Templater Scripts

Traditional Templater script:

```javascript
let name = await tp.system.prompt("What's your name?");
let isStudent = await tp.system.prompt("Are you a student?", "yes/no");
console.log(Name: ${name});
console.log(Is student: ${isStudent === 'yes' ? 'Yes' : 'No'});

```


Unified Question Handler approach:

```javascript
const api = window.unifiedQuestionHandler;
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
console.log(Name: ${answers.name});
console.log(Is student: ${answers.isStudent ? 'Yes' : 'No'});
}

```

The main differences are:
1. All questions are presented in a single modal, improving user experience.
2. Question types are more diverse and can be easily extended.
3. Answers are returned as a single object, making it easier to handle multiple inputs.

## Using Index Files

Index files allow you to maintain lists of options for your questions. For example:


```js
const questions = [
{
type: "fuzzySuggester",
prompt: "Select your favorite color:",
answerId: "favoriteColor",
indexPath: "Meta/Indices/Colors.md"
}
];

```

In this example, `Colors.md` would contain a list of color options:

```
Red
Blue
Green
Yellow
Purple

```

The Unified Question Handler will read this file and present these options to the user with fuzzy search capabilities.

## More Examples

Check out the `examples` directory in this repository for more detailed usage examples.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
