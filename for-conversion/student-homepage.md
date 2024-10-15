<%\*
// Instantiating indexoperations class, see Obsidian Tutoring log 2024-02-06 in Main vault (Blake) for notes
let frontMatterVersion = "5.0.0"
const indexOps = new tp.user.IndexOperations(tp);
const tags = "homepage/student";
let studentEmail, universityName, universityCourse, yearLevel, invoiceEmail, additionalEmails, firstName, lastName, xeroContactId, specialNotes;

// Reusing the class methods
firstName = await tp.system.prompt("Enter the student's first name:");
lastName = await tp.system.prompt("Enter the student's last name:");
studentEmail = await tp.system.prompt("Enter the student's primary email address:");
invoiceEmail = await tp.system.prompt("Enter the student's invoice email (optional):");
additionalEmails = await tp.system.prompt("Enter additional emails (comma-separated, optional):");
universityName = await indexOps.selectFromIndexWithManualEntry('Meta/Indices/Universities_Index.md', "Enter the university's name:");
universityCourse = await indexOps.selectFromIndexWithManualEntry('Meta/Indices/Courses_Index.md', "Enter the student's course:");
yearLevel = await tp.system.suggester(['1', '2', '3', '4', '5'], ['1', '2', '3', '4', '5'], false, "Select the student's year level (1-5):");
xeroContactId = ""; // Leave blank initially
specialNotes = await tp.system.prompt("Enter any special notes or requirements (optional):");

// Get the tutor index
const tutorIndexPath = 'Meta/Indices/Tutor_Index.md';
const tutors = await indexOps.readIndexFile(tutorIndexPath);

// Function to get default rate from tutor's front matter
async function getDefaultRate(tutor, yearLevel) {
const dv = app.plugins.plugins["dataview"].api;
const tutorPage = dv.pages('').filter(p => p.file.tags.includes("#homepage/tutor") && p.name === tutor).first();
if (tutorPage) {
return tutorPage[`rate_${yearLevel}`];
}
return null;
}

// Generate questions for each tutor
let tutorRates = {};
for (let tutor of tutors) {
let defaultRate = await getDefaultRate(tutor, yearLevel);
let rate = await tp.system.prompt(`What is ${tutor}'s rate for ${firstName}? (Optional: default is ${defaultRate})`);
tutorRates[`rate_${tutor.toLowerCase()}`] = rate || defaultRate;
}

// Output the front matter using the details collected above
const frontMatter = `---
front-matter-v: ${frontMatterVersion}
uuid: ${tp.file.creation_date("YYYYMMDDHHmmss")}
aliases: "${firstName} ${lastName} Homepage"
tags: ${tags}
name: "${firstName} ${lastName}"
first_name: "${firstName}"
last_name: "${lastName}"
email: "${studentEmail}"
invoice_email: "${invoiceEmail}"
additional_emails: "${additionalEmails}"
university: "[[${universityName}]]"
course: "[[${universityCourse}]]"
year_level: "${yearLevel}"
xero_contact_id: "${xeroContactId}"
special_notes: "${specialNotes}"
${Object.entries(tutorRates).map(([key, value]) => `${key}: ${value}`).join('\n')}
archive: FALSE
start_date: ${tp.file.creation_date("YYYY-MM-DD")}
skip_database: false
---`;
tR += frontMatter;
%>
