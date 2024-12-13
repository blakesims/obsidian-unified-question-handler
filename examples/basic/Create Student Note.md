# Create Student Note Example

#TODO No need to do the replacing for the title fo the note - spaces are allowed, just not things like special charactesr, so change that in the student note creation process below
This example demonstrates how to create a new note with information gathered from questions.

To run this example:

1. Make sure you have both `Templater` and `Unified Question Handler` plugins installed and enabled
2. Open the command palette (Ctrl/Cmd + P)
3. Run "Templater: Replace templates in the active file"

<%\*
const api = app.plugins.plugins['unified-question-handler'].api;

// First, ask for confirmation
const confirmQuestion = [{
type: "checkbox",
prompt: "This will create a new note for demonstration purposes at 'examples/Students/'. You can delete this afterwards. Continue?",
answerId: "confirm"
}];

const confirmAnswer = await api.askQuestions(confirmQuestion);

if (!confirmAnswer || !confirmAnswer.confirm) {
tR += "\n\n> Operation cancelled by user.";
return;
}

// If confirmed, proceed with the main questions
const questions = [
{
type: "inputPrompt",
prompt: "Student's full name:",
answerId: "name"
},
{
type: "fuzzySuggester",
prompt: "Select their subject:",
answerId: "subject",
indexPath: "examples/indices/Subjects.md",
allowNewEntry: true
},
{
type: "inputPrompt",
prompt: "What is their hourly rate?",
answerId: "rate",
defaultValue: "50"
}
];

const answers = await api.askQuestions(questions);

if (answers) {
// Create the folder if it doesn't exist
const folder = "examples/Students";
if (!app.vault.getAbstractFileByPath(folder)) {
await app.vault.createFolder(folder);
}

    // Generate the content
    const content = `---

student_name: ${answers.name}
subject: ${answers.subject}
rate: ${answers.rate}
created_date: ${tp.date.now()}

---

# ${answers.name}'s Profile

## Details

- Subject: ${answers.subject}
- Rate: $${answers.rate}/hour

## Notes

## Progress

`;

    // Create the new file
    const fileName = `${folder}/${answers.name.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    await app.vault.create(fileName, content);

    // Provide feedback in the current note
    tR += "\n\n> ✅ New student note created successfully!\n";
    tR += `> You can find it at: \`${fileName}\`\n`;
    tR += "> You can delete this note and the created student note when you're done testing.";

}
%>

