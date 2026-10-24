# claude-agent-workflow

A small showcase of a Claude Code agent workflow, used from Visual Studio Code.
One slash command, `/ship-check`, takes a task, has a **coder** agent build it
and a **reviewer** agent check it, then stops so you can approve the change
before anything is committed.

The code being worked on is a minimal Google Apps Script web app.

## Repository layout

```
.
├── .claude/
│   ├── agents/
│   │   ├── coder.md        # subagent that writes the code
│   │   └── reviewer.md     # read-only subagent that reviews the diff
│   └── commands/
│       └── ship-check.md   # the /ship-check slash command
├── Apps Script code assets/
│   ├── Code.gs             # server-side Apps Script
│   └── Index.html          # page served by the web app (HTML/CSS/JS)
└── README.md
```

## The Apps Script app

- `Code.gs`: `doGet()` serves `Index.html` as the web app page.
  `getGreeting(name)` returns `Hello, <name>!`, or `Hello, world!` when no
  name is given.
- `Index.html`: a page with a name input and a **Greet** button. The button
  calls `getGreeting` on the server with `google.script.run` and shows the
  result, or an error message if the call fails.

To run it, copy both files into an Apps Script project (keep the HTML file
named `Index`), then use **Deploy → New deployment → Web app**.

## Agents

Agents are defined in `.claude/agents/`. Each file starts with frontmatter
that sets the agent's name, its description, and the tools it may use.

### `coder`
- **Tools:** Read, Write, Edit, Glob, Grep, Bash
- Makes the requested change with small, focused edits that follow the
  existing code style.
- Adds or updates tests when behavior changes.
- Never commits. Reports which files it changed and why.

### `reviewer`
- **Tools:** Read, Glob, Grep, Bash. It is read-only and never edits files.
- Reviews the uncommitted changes using `git status` and `git diff`.
- Groups its findings under **Security**, **Correctness and edge cases**, and
  **Quality**.
- Labels each finding **Blocker**, **Should fix**, or **Nit**, with the file
  and line.
- Ends with a verdict: **APPROVE** or **CHANGES REQUESTED**.

## The `/ship-check` command

Defined in `.claude/commands/ship-check.md`. Run it in Claude Code:

```
/ship-check <task description>
```

For example: `/ship-check add a farewell button next to Greet`.

All work goes into the two existing files, `Apps Script code assets/Code.gs`
and `Apps Script code assets/Index.html`, edited in place. The command doesn't
allow new files or folders anywhere else.

### Flow

1. **Implement.** The `coder` agent makes the change in `Code.gs` and/or
   `Index.html`.
2. **Review.** The `reviewer` agent checks the uncommitted diff. It also checks
   that nothing outside those two files changed.
3. **Fix loop.** If the verdict is CHANGES REQUESTED, the Blocker and Should-fix
   items go back to the coder, and the reviewer checks the result again. This
   runs for at most 2 rounds.
4. **Summary.** Claude reports the files changed, what changed and why, any
   remaining review findings, and the tests that were run.
5. **Approval gate.** Nothing is committed or pushed until you approve.

```
task ─▶ coder ─▶ reviewer ─┬─ APPROVE ─────────────▶ summary ─▶ you approve ─▶ commit
                  ▲        └─ CHANGES REQUESTED ─┐
                  └──────── (max 2 rounds) ──────┘
```

## Branches

- `dev` is the working branch.
- `main` holds the approved setup and is updated from `dev`.
