# Simple Questions Example

This example demonstrates how to ask questions and display the answers directly in this note.

To run this example:
1. Make sure you have both `Templater` and `Unified Question Handler` plugins installed and enabled
2. Open the command palette (Ctrl/Cmd + P)
3. Run "Templater: Replace templates in the active file"

<%*
const api = app.plugins.plugins['unified-question-handler'].api;

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
    },
    {
        type: "fuzzySuggester",
        prompt: "What's your favorite color?",
        answerId: "color",
        options: ["Red", "Blue", "Green", "Yellow", "Purple"]
    }
];

const answers = await api.askQuestions(questions);

if (answers) {
    tR += `## Your Answers\n\n`;
    tR += `- Name: ${answers.name}\n`;
    tR += `- Student: ${answers.isStudent ? 'Yes' : 'No'}\n`;
    tR += `- Favorite Color: ${answers.color}\n`;
}
%> 
