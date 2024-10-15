module.exports = async (params) => {
  const { app, quickAddApi } = params;

  // Get the templater object
  const templater = app.plugins.plugins["templater-obsidian"].templater;

  // Find the system module from the functions_generator.internal_functions.modules_array
  const systemModule = templater.functions_generator.internal_functions.modules_array.find(m => m.name === "system");

  // Access the suggester function from the static_object of the system module
  const suggester = systemModule.static_object.suggester;

  // Exit survey for tutors
  const tutorDifficulty = await suggester(
    ["1 - very easy", "2 - easy", "3 - moderate", "4 - hard", "5 - very hard"],
    ["1", "2", "3", "4", "5"],
    false,
    "Rate the mathematical difficulty of the tutorial for you, as the tutor:"
  );

  const studentDifficulty = await suggester(
    ["1 - very easy", "2 - easy", "3 - moderate", "4 - hard", "5 - very hard"],
    ["1", "2", "3", "4", "5"],
    false,
    "Rate the mathematical difficulty of the tutorial from the student's perspective:"
  );

  const tutorialRating = await suggester(
    ["1 - very bad", "2 - bad", "3 - moderate", "4 - good", "5 - very good"],
    ["1", "2", "3", "4", "5"],
    false,
    "Rate the tutorial overall:"
  );
  const tutorReflection = await quickAddApi.inputPrompt("Please provide a brief reflection on the tutorial:") || "";
  const nextTime = await quickAddApi.inputPrompt("What content should we cover next time?") || "";

  const tutorFeedback = {
    tutorDifficulty,
    studentDifficulty,
    tutorialRating,
    tutorReflection,
    nextTime
  };

  // Load temporary tutorial config to identify the UUID for the current tutorial
  const tempConfigPath = "Meta/System/temp_tutorial_config.json";
  const tempConfig = JSON.parse(await app.vault.adapter.read(tempConfigPath));
  const currentUUID = tempConfig.config.uuid;
  const tutorName = tempConfig.config.tutorName;

  // Append the tutor feedback to the temporary tutorial config
  tempConfig.config.tutorFeedback = tutorFeedback;

  // Save the updated temporary tutorial config
  await app.vault.adapter.write(tempConfigPath, JSON.stringify(tempConfig, null, 2));
  console.log('Tutor feedback appended to the temporary tutorial config successfully!');

  // Load permanent tutor config
  const permanentConfigPath = `Meta/Configs/${tutorName}_tutoring_config.json`;
  const permanentConfig = JSON.parse(await app.vault.adapter.read(permanentConfigPath));

  // Find the current tutorial's configuration using the UUID
  const currentTutorialConfig = permanentConfig.configs.find(config => config.uuid === currentUUID);

  if (currentTutorialConfig) {
    // Append the tutor feedback to the current tutorial's configuration
    currentTutorialConfig.tutorFeedback = tutorFeedback;

    // Save the updated permanent tutor config
    await app.vault.adapter.write(permanentConfigPath, JSON.stringify(permanentConfig, null, 2));
    console.log('Tutor feedback appended to the current tutorial\'s configuration successfully!');
  } else {
    console.warn('Current tutorial\'s configuration not found in the permanent tutor config.');
  }

  // Save the tutor feedback to the temp_tutor_feedback.json file
  const tutorFeedbackPath = "Meta/System/temp_tutor_feedback.json";
  await app.vault.adapter.write(tutorFeedbackPath, JSON.stringify(tutorFeedback, null, 2));
  console.log('Tutor feedback saved to temp_tutor_feedback.json successfully!');

  // Check if the stop signal file already exists
  const stopSignalPath = "Meta/System/stop_signal.md";
  if (await app.vault.adapter.exists(stopSignalPath)) {
    console.warn('Stop signal already exists. Auto-transcription was not running.');
    new Notice('Stop signal already exists. Auto-transcription was not running. Please check the logs in the Meta/System directory for more information.');
  } else {
    // Create the stop signal file after saving the tutor feedback
    await app.vault.create(stopSignalPath, '');
    console.log('Stop signal created successfully!');
  }
};

