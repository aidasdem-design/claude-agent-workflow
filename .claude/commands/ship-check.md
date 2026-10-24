Task: $ARGUMENTS

Target files: all work goes into the two existing files in
`Apps Script code assets/`:
- `Code.gs` for server-side Apps Script code
- `Index.html` for the HTML, CSS and client-side JS served by `doGet()`
Edit these files in place. Do NOT create new files or folders elsewhere.

1. Use the coder subagent to implement the task. Tell it the target files above.
2. Use the reviewer subagent to review the uncommitted diff. Also check that
   no files outside `Apps Script code assets/Code.gs` and `Index.html` changed.
3. If the verdict is CHANGES REQUESTED, send the Blocker and Should-fix items
   back to the coder, then review again. Maximum 2 rounds.
4. Finish with a plain-language summary: files changed, what and why,
   remaining review findings, and tests run.
5. Do NOT commit or push. Wait for my approval.
