// Example of dynamic questions based on previous answers
const api = app.plugins.plugins['unified-question-handler'].api;

// Initial questions
const initialQuestions = [
    {
        type: "checkbox",
        prompt: "Are you a student?",
        answerId: "isStudent"
    }
];

// Function to generate follow-up questions based on initial answers
async function generateFollowUpQuestions(answers) {
    const followUpQuestions = [];
    
    if (answers.isStudent) {
        followUpQuestions.push(
            {
                type: "fuzzySuggester",
                prompt: "Select your university:",
                answerId: "university",
                indexPath: "Meta/Indices/Universities.md",
                allowNewEntry: true
            },
            {
                type: "fuzzySuggester",
                prompt: "Select your course:",
                answerId: "course",
                indexPath: "Meta/Indices/Courses.md",
                allowNewEntry: true
            }
        );
    } else {
        followUpQuestions.push({
            type: "inputPrompt",
            prompt: "What is your occupation?",
            answerId: "occupation"
        });
    }
    
    return followUpQuestions;
}

// Use dynamic questions
const allAnswers = await api.askDynamicQuestions(initialQuestions, generateFollowUpQuestions);
if (allAnswers) {
    console.log('All answers:', allAnswers);
} 