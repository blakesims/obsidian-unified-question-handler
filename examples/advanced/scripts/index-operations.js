// Example of index file operations
const api = app.plugins.plugins['unified-question-handler'].api;

// Reading from an index file
const universities = await api.readIndexFile("Meta/Indices/Universities.md");
console.log('Available universities:', universities);

// Adding a new entry to an index file
const newUniversity = "New University";
const added = await api.appendToIndexFile("Meta/Indices/Universities.md", newUniversity);
if (added) {
    console.log(`Successfully added ${newUniversity} to the index`);
} else {
    console.log(`Failed to add ${newUniversity} to the index`);
} 