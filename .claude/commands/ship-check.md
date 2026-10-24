Task: $ARGUMENTS

1. Use the coder subagent to implement the task.
2. Use the reviewer subagent to review the uncommitted diff.
3. If the verdict is CHANGES REQUESTED, send the Blocker and Should-fix items
   back to the coder, then review again. Maximum 2 rounds.
4. Finish with a plain-language summary: files changed, what and why,
   remaining review findings, and tests run.
5. Do NOT commit or push. Wait for my approval.
