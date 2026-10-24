Task: $ARGUMENTS

Target files: all work goes into the two existing files in
`Apps Script code assets/`:
- `Code.gs` for server-side Apps Script code
- `Index.html` for the HTML, CSS and client-side JS served by `doGet()`
- `appsscript.json` (the manifest) only when the task needs it, e.g. new
  OAuth scopes, advanced services or web app settings
Edit these files in place. Do NOT create new files or folders elsewhere.
This folder is the clasp `rootDir`: `npm run push` uploads it to the linked
Apps Script project and replaces what is there.

1. Use the coder subagent to implement the task. Tell it the target files above.
2. Use the reviewer subagent to review the uncommitted diff. Also check that
   no files outside `Apps Script code assets/` changed, and that
   `appsscript.json` changed only if the task needed it.
3. If the verdict is CHANGES REQUESTED, send the Blocker and Should-fix items
   back to the coder, then review again. Maximum 2 rounds.
4. Finish with a plain-language summary: files changed, what and why,
   remaining review findings, and tests run.
5. Do NOT commit, git push, or `clasp push`. Wait for my approval.
