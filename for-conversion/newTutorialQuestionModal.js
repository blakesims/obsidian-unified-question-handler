module.exports = async (params) => {
  const { app } = params;
  const fs = require("fs");
  const path = require("path");
  const vaultConfigPath = path.join(
    app.vault.adapter.basePath,
    "Meta/vault_config.json",
  );
  let titleFormat = "yyyy-mm-dd-Title";
  try {
    const vaultConfig = JSON.parse(fs.readFileSync(vaultConfigPath, "utf-8"));
    titleFormat = vaultConfig.tutorialTitleFormat || titleFormat;
  } catch (error) {
    console.error("Error reading vault config:", error);
  }

  // Get the templater object
  const templater = app.plugins.plugins["templater-obsidian"].templater;

  // Find the file module from the functions_generator.internal_functions.modules_array
  const fileModule =
    templater.functions_generator.internal_functions.modules_array.find(
      (m) => m.name === "file",
    );

  // Access the create_new function from the static_object of the file module
  const createNew = fileModule.static_object.create_new;
  // Access the find_tfile function from the static_object of the file module
  const findTFile = fileModule.static_object.find_tfile;

  // Generate UUID based on current date-time
  const now = new Date();
  const uuid = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;

  // Get the Unified Question Handler API
  const api = window.unifiedQuestionHandler;
  if (!api) {
    console.error(
      "Unified Question Handler API is not available. Make sure the plugin is loaded and initialized.",
    );
    return;
  }

  // Define questions for the Unified Question Handler
  const questions = [
    {
      type: "indexedManual",
      prompt: "Who is tutoring?",
      answerId: "tutorName",
      indexPath: "Meta/Indices/Tutor_Index.md",
    },
    {
      type: "indexedManual",
      prompt: "Student Name:",
      answerId: "studentName",
      indexPath: "Meta/Indices/Students_Index.md",
    },
    {
      type: "inputPrompt",
      prompt: "Enter the expected duration of the tutorial in minutes:",
      answerId: "duration",
      defaultValue: "60",
    },
    {
      type: "tpsuggester",
      prompt: "Subject:",
      answerId: "subjectName",
      options: ["Math", "Physics", "Chemistry", "Biology", "Computer Science"],
      allowNewEntry: true,
    },
    {
      type: "inputPrompt",
      prompt: "Enter the title of the tutorial:",
      answerId: "title",
    },
    {
      type: "checkbox",
      prompt: "Do you want a summary/transcription?",
      answerId: "generateSummaryTranscription",
      defaultValue: false,
    },
    {
      type: "tpsuggester",
      prompt: "Select the transcription model:",
      answerId: "whisperModel",
      options: ["tiny.en", "base.en", "small.en", "medium.en"],
      defaultValue: "base.en",
    },
    {
      type: "tpsuggester",
      prompt: "Select the LLM model:",
      answerId: "llmModel",
      options: ["gpt-4o", "gpt-4-0125-preview", "gpt-3.5-turbo-0125"],
      defaultValue: "gpt-4o",
    },
    {
      type: "fuzzySuggester",
      prompt: "Select the transcription model:",
      answerId: "whisperModel",
      options: ["tiny.en", "base.en", "small.en", "medium.en"],
      defaultValue: "base.en",
    },
    {
      type: "fuzzySuggester",
      prompt: "Select the prompt file:",
      answerId: "promptFile",
      indexPath: "Meta/Indices/Prompts_Index.md",
      defaultValue: "default_maths",
      allowNewEntry: true,
    },
    {
      type: "checkbox",
      prompt: "Is this for testing?",
      answerId: "isTesting",
      defaultValue: false,
    },
  ];

  // Ask questions using the Unified Question Handler
  const answers = await api.askQuestions(questions);

  if (!answers) {
    console.log("User cancelled or closed the modal");
    return; // Exit the script if the user cancelled
  }

  let metadata = {
    uuid: uuid,
    tutorName: answers.tutorName,
    studentName: answers.studentName,
    duration: answers.duration,
    subjectName: answers.subjectName,
    topics: [],
    title: answers.title,
    generateSummaryTranscription: answers.generateSummaryTranscription,
    customSettings: {
      isTesting: answers.isTesting,
      whisperModel: answers.whisperModel,
      llmModel: answers.llmModel,
      promptFile: answers.promptFile,
    },
  };

  // Handle topics separately as it's a multi-select question
  const topicsQuestion = {
    type: "multiSelect",
    prompt: "Select topics that apply (optional):",
    answerId: "topics",
    options: ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry"],
    allowNewEntry: true,
    min: 0, // Changed from 1 to 0 to make it optional
    max: 5,
  };

  const topicsAnswer = await api.askQuestions([topicsQuestion]);
  if (!topicsAnswer) {
    console.log("User cancelled or closed the modal for topics selection");
    return; // Exit the script if the user cancelled
  }

  // Initialize topics as an empty array
  metadata.topics = [];

  // If topics were selected, add them to metadata
  if (topicsAnswer.topics && topicsAnswer.topics.length > 0) {
    metadata.topics = topicsAnswer.topics;
  }

  // Log the result
  console.log(
    "Selected topics:",
    metadata.topics.length > 0
      ? metadata.topics.join(", ")
      : "No topics selected",
  );
  // Create the config directory if it doesn't exist
  const configDir = "Meta/Configs";
  if (!(await app.vault.adapter.exists(configDir))) {
    await app.vault.createFolder(configDir);
  }

  // Load existing config data (if any)
  const metadataFilePath = `${configDir}/${metadata.tutorName}_tutoring_config.json`;
  let existingConfig = { configs: [] };
  try {
    const existingConfigContent =
      await app.vault.adapter.read(metadataFilePath);
    existingConfig = JSON.parse(existingConfigContent);
  } catch (error) {
    console.log("No existing config found. Creating a new one.");
  }

  // Add the new metadata entry to the existing config
  existingConfig.configs = [...(existingConfig.configs || []), metadata];

  // Save the updated config data
  await app.vault.adapter.write(
    metadataFilePath,
    JSON.stringify(existingConfig, null, 2),
  );

  console.log("Metadata collected and saved to:", metadataFilePath);

  // Save the current tutorial config to a temporary file
  const tempConfigPath = "Meta/System/temp_tutorial_config.json";
  const tempConfig = { config: metadata };

  // Create the System directory if it doesn't exist
  const systemDir = "Meta/System";
  if (!(await app.vault.adapter.exists(systemDir))) {
    await app.vault.createFolder(systemDir);
  }

  await app.vault.adapter.write(
    tempConfigPath,
    JSON.stringify(tempConfig, null, 2),
  );

  console.log("Temporary tutorial config saved to:", tempConfigPath);

  // Create a new tutorial note using the Templater commands
  const templatePath = "Config Tutoring Template";

  const studentFolder = `Tutoring/Students/${metadata.studentName}`;

  // Get the current date in the format YYYY-MM-DD
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;

  // Format the title using the vault config's title format
  const newFileName = titleFormat
    .replace("yyyy", currentDate.getFullYear())
    .replace("mm", (currentDate.getMonth() + 1).toString().padStart(2, "0"))
    .replace("dd", currentDate.getDate().toString().padStart(2, "0"))
    .replace("Title", metadata.title);

  // Find the template file
  const templateFile = await findTFile(templatePath);

  if (templateFile) {
    // Create the new tutorial note
    const newFilePath = await createNew(
      templateFile,
      newFileName,
      true,
      app.vault.getAbstractFileByPath(studentFolder),
    );

    if (newFilePath) {
      console.log("New tutorial note created:", newFilePath);
    } else {
      console.error("Failed to create new tutorial note.");
    }
  } else {
    console.error("Template file not found:", templatePath);
  }

  const { spawn, exec } = require("child_process");
  const os = require("os");

  // Script for triggering the auto_transcribe and summary generation workflow, if user selected
  if (metadata.generateSummaryTranscription) {
    const vaultPath = app.vault.adapter.basePath;
    const shellScript = path.join(
      ".obsidian",
      "scripts",
      "ai-notes",
      "auto_transcribe.sh",
    );
    const notePath = path.join(
      "Tutoring",
      "Students",
      metadata.studentName,
      newFileName,
    );
    const model = metadata.customSettings.whisperModel;
    const duration = metadata.duration;

    const logFile = path.join(
      vaultPath,
      "Meta",
      "System",
      "auto_transcribe_sh.log",
    );

    if (os.platform() === "win32") {
      const gitBashPath = "C:\\Program Files\\Git\\bin\\bash.exe";
      const unixStyleVaultPath = vaultPath.replace(/\\/g, "/");
      const unixStyleNotePath = notePath
        .replace(/\\/g, "/")
        .replace(/'/g, "'\\''");
      const unixStyleShellScript = shellScript.replace(/\\/g, "/");
      const command = `"${gitBashPath}" -c "cd '${unixStyleVaultPath}' && '${unixStyleShellScript}' '${unixStyleVaultPath}' '${unixStyleNotePath}' '${metadata.studentName}' '${model}' '${duration}'"`;

      exec(command, { stdio: "inherit" }, (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing command:", error);
          fs.appendFileSync(
            logFile,
            `Error executing command: ${error.message}\n`,
          );
          return;
        }
        console.log("Command output:", stdout);
        fs.appendFileSync(logFile, `Command output: ${stdout}\n`);
      });
    } else {
      // Handle non-Windows case
      const logFd = fs.openSync(logFile, "a");
      const unixStyleShellScript = path.join(vaultPath, shellScript);
      const child = spawn(
        unixStyleShellScript,
        [vaultPath, notePath, metadata.studentName, model, duration.toString()],
        {
          detached: true,
          stdio: ["ignore", logFd, logFd],
        },
      );
      child.unref();
    }
    console.log("auto_transcribe script started in the background");
  } else {
    console.log("Skipping auto_transcribe script based on user config");
  }
};

