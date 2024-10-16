# Making Releases for Obsidian Unified Question Handler

1. Update your code and commit changes.

2. Bump the version in `package.json`, `manifest.json`, and `versions.json`:
   ```
   npm version patch
   ```
   (Use `minor` or `major` instead of `patch` if appropriate)

3. Commit the version bump:
   ```
   git add package.json manifest.json versions.json
   git commit -m "Bump version to x.x.x"
   ```

4. Create and push a new tag:
   ```
   git tag -a vx.x.x -m "Release vx.x.x"
   git push && git push --tags
   ```

5. The GitHub Actions workflow will automatically:
   - Build the plugin
   - Create a draft release
   - Attach `main.js`, `manifest.json`, and `styles.css` to the release

6. Go to your GitHub repository's releases page.

7. Find the draft release, review it, and publish it manually.

Note: Ensure your `.github/workflows/release.yml` file is properly configured with the necessary permissions for this process to work.
