// Example showing all available question types
const api = app.plugins.plugins['unified-question-handler'].api;

const questions = [
    {
        type: "inputPrompt",
        prompt: "Enter your full name:",
        answerId: "fullName"
    },
    {
        type: "checkbox",
        prompt: "Would you like email notifications?",
        answerId: "emailNotifications"
    },
    {
        type: "fuzzySuggester",
        prompt: "Select your country:",
        answerId: "country",
        indexPath: "Meta/Indices/Countries.md",
        allowNewEntry: true
    },
    {
        type: "multiSelect",
        prompt: "Select your interests:",
        answerId: "interests",
        options: ["Reading", "Writing", "Coding", "Music"],
        allowNewEntry: true
    },
    {
        type: "indexedManual",
        prompt: "Select your university:",
        answerId: "university",
        indexPath: "Meta/Indices/Universities.md",
        allowNewEntry: true
    }
];

const answers = await api.askQuestions(questions);
if (answers) {
    console.log('Full Name:', answers.fullName);
    console.log('Email Notifications:', answers.emailNotifications);
    console.log('Country:', answers.country);
    console.log('Interests:', answers.interests);
    console.log('University:', answers.university);
} 