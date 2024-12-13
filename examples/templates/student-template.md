<%*
const api = app.plugins.plugins['unified-question-handler'].api;

const questions = [
    {
        type: "inputPrompt",
        prompt: "What is the student's name?",
        answerId: "name"
    },
    {
        type: "fuzzySuggester",
        prompt: "What subject are they studying?",
        answerId: "subject",
        indexPath: "../indices/Subjects.md",
        allowNewEntry: true
    },
    {
        type: "inputPrompt",
        prompt: "What is their hourly rate?",
        answerId: "rate"
    }
];

const answers = await api.askQuestions(questions);

if (answers) {
tR = `---
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
}
%> 