# Making Releases for Obsidian Unified Question Handler

1. Update your code and commit changes.

2. Bump the version:
   ```
   npm version patch
   ```
   (Use `minor` or `major` instead of `patch` if appropriate)

3. Push changes and tags:
   ```
   git push && git push --tags
   ```

4. The GitHub Actions workflow will automatically:
   - Build the plugin
   - Create a draft release
   - Attach `main.js`, `manifest.json`, and `styles.css` to the release

5. Go to your GitHub repository's releases page.

6. Find the draft release, review it, and publish it manually.

Note: Ensure your `.github/workflows/release.yml` file is properly configured for this process to work.
