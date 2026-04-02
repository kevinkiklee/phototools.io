Commit all changes, push to GitHub, monitor the CI build, and fix any issues. Follow these steps exactly:

1. **Pre-flight checks** — Run `npm run lint`, `npm test`, and `npm run build` locally. If anything fails, fix it before proceeding.

2. **Commit** — Stage all changed files (be selective — skip .env, credentials, or large binaries). Write a concise commit message summarizing the changes. Use conventional commit style if possible.

3. **Push** — Push to the current branch on origin. If no upstream is set, push with `-u`.

4. **Monitor CI** — Use `gh run list --limit 1` and `gh run watch` to monitor the GitHub Actions build triggered by the push. Check the status every few seconds.

5. **If CI fails** — Read the failure logs with `gh run view --log-failed`. Diagnose the issue, fix it locally, run the pre-flight checks again, then commit and push the fix. Repeat until CI passes.

6. **Report** — Once CI is green, report the final status including the commit SHA, branch, and deployment URL if applicable.
