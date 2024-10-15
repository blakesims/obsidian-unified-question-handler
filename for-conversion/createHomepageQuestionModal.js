const ConfigManager = require(
  app.vault.adapter.basePath + "/TemplatesJS/ConfigManager.js",
);

async function createHomepage(tp) {
  const configData = await ConfigManager.fetchConfig();
  const homepageTypes = configData.homepageTypes.map((type) => type.id);
  let selectedTypeId = await tp.system.suggester(
    homepageTypes,
    homepageTypes,
    false,
    "Select the type of homepage:",
  );
  if (!selectedTypeId) {
    console.error("Homepage type selection cancelled");
    return;
  }
  let selectedConfig = configData.homepageTypes.find(
    (ht) => ht.id === selectedTypeId,
  );
  let entityName = await promptForEntityName(tp, selectedConfig.id);
  if (!entityName) return;

  await createFromTemplate(tp, selectedConfig, entityName);
  // Ensure we're passing the correct path format to replacePlaceholders
  // This is buggy - I can't get the entityname to be updated as of 21st feb
  //const newNoteDir = `${selectedConfig.folder}/${entityName}`;
  //const newNoteFilename = `${entityName} Homepage.md`;
  //await replacePlaceholders(tp, `${newNoteDir}/${newNoteFilename}`, entityName);
}

async function createFromTemplate(tp, config, entityName) {
  if (!entityName) return;

  // Ensure the template exists
  const templatePath = `${config.templateFolderPath}/${config.template}`;
  const templateFile = await app.vault.getAbstractFileByPath(templatePath);
  if (!templateFile) {
    new Notice(`Template not found: ${templatePath}`);
    return;
  }

  // Fetch the folder object where the new note should be created
  const folderPath = `${config.folder}/${entityName}`;
  let folder = app.vault.getAbstractFileByPath(folderPath);
  if (!folder) {
    // If the folder doesn't exist, create it
    folder = await app.vault.createFolder(folderPath);
  }

  // Define the new note's filename
  const newNoteFilename = `${entityName} Homepage`;

  // Use the template to create a new note within the correct folder
  await tp.file.create_new(templateFile, newNoteFilename, true, folder);

  new Notice(
    `New ${config.id} homepage created: ${folderPath}/${newNoteFilename}`,
  );
}

async function promptForEntityName(tp, type) {
  const entityName = await tp.system.prompt(
    `What is the name of the ${type} for the title?`,
  );
  if (!entityName) {
    new Notice(`${type} creation cancelled.`);
    return; // Removed throw to allow graceful exit
  }
  return entityName;
}

// async function replacePlaceholders(tp, notePath, entityName) {
//     const file = app.vault.getAbstractFileByPath(notePath);
//     if (file instanceof File) {
//         let content = await app.vault.read(file);
//         content = content.replace(/\$\{entityName\}/g, entityName);
//         await app.vault.modify(file, content);
//         console.log(`Updated placeholders in ${notePath}`);
//     } else {
//         console.error(`File not found: ${notePath}`);
//     }
// }

module.exports = createHomepage;

