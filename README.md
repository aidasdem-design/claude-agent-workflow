# claude-agent-workflow

A small showcase of a Claude Code agent workflow, used from Visual Studio Code.
One slash command, `/ship-check`, takes a task, has a **coder** agent build it
and a **reviewer** agent check it, then stops so you can approve the change
before anything is committed.

The code being worked on is a minimal Google Apps Script web app. The files in
`Apps Script code assets/` are the source of truth, and
[clasp](https://github.com/google/clasp) syncs them with the linked Apps
Script project.

## Repository layout

```
.
├── .claude/
│   ├── agents/
│   │   ├── coder.md        # subagent that writes the code
│   │   └── reviewer.md     # read-only subagent that reviews the diff
│   └── commands/
│       └── ship-check.md   # the /ship-check slash command
├── Apps Script code assets/ # clasp rootDir: everything here is pushed
│   ├── appsscript.json     # project manifest (time zone, runtime, web app)
│   ├── Code.gs             # server-side Apps Script
│   └── Index.html          # page served by the web app (HTML/CSS/JS)
├── .github/workflows/
│   └── apps-script-push.yml # pushes to Apps Script when main changes
├── .clasp.json             # links this repo to the Apps Script project
├── package.json            # pins clasp and adds npm scripts
└── README.md
```

## The Apps Script app

- `Code.gs`: `doGet()` serves `Index.html` as the web app page.
  `getGreeting(name)` returns `Hello, <name>!`, or `Hello, world!` when no
  name is given.
- `Index.html`: a page with a name input and a **Greet** button. The button
  calls `getGreeting` on the server with `google.script.run` and shows the
  result, or an error message if the call fails.

## Syncing with Apps Script (clasp)

`.clasp.json` links the repo to
[this Apps Script project](https://script.google.com/home/projects/1rDyn0PRr2z7XN---LmfBNToYBYzTUNHan8a38lTnz5ZbXgu7R8TlABUv/edit)
and sets `rootDir` to `Apps Script code assets/`. clasp is pinned as a dev
dependency, so there's no global install.

### The Apps Script project is updated only from `main`

The GitHub Actions workflow `.github/workflows/apps-script-push.yml` runs
`clasp push --force` whenever `main` gets a push that changes
`Apps Script code assets/` or `.clasp.json`. You can also run it by hand from
the **Actions** tab (**Run workflow**). Work on `dev` never reaches Apps Script.
To ship a change, merge `dev` into `main`.

A push **replaces** every file in the remote project, so make all edits in the
repo, not in the online editor.

One-time setup:

1. Run `npm install`.
2. Turn on the **Google Apps Script API** at
   <https://script.google.com/home/usersettings>.
3. Run `npm run login`. This opens a browser to authorize clasp, and the
   credentials are saved to `~/.clasprc.json`, outside the repo.
4. Store those credentials as the repo secret `CLASPRC_JSON` so the workflow
   can use them:
   `gh secret set CLASPRC_JSON < ~/.clasprc.json`.
   If you ever run `clasp logout` or revoke clasp's access in your Google
   account, run steps 3 and 4 again.

Local helpers (there is deliberately no push script):

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `npm run status` | Lists the files the workflow would push                  |
| `npm run pull`   | Downloads the remote files and overwrites the local ones |
| `npm run open`   | Opens the project in the Apps Script editor              |

To publish the web app, use **Deploy → New deployment → Web app** in the
editor, or `npx clasp deploy`. The manifest sets the web app to run as you
and to be reachable only by you (`MYSELF`). Change `webapp.access` in
`appsscript.json` to open it up.

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

All work goes into the existing files, `Apps Script code assets/Code.gs` and
`Apps Script code assets/Index.html`, edited in place. `appsscript.json` is
touched only when the task needs it, for example new scopes. The command
doesn't allow new files or folders anywhere else.

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
5. **Approval gate.** Nothing is committed or pushed to git until you approve.
   Nothing is ever pushed to Apps Script directly: that only happens when
   `main` is updated.

```
task ─▶ coder ─▶ reviewer ─┬─ APPROVE ─────────────▶ summary ─▶ you approve ─▶ commit
                  ▲        └─ CHANGES REQUESTED ─┐
                  └──────── (max 2 rounds) ──────┘
```

## Branches

- `dev` is the working branch.
- `main` holds the approved setup and is updated from `dev`. Every update to
  `main` deploys the code to the Apps Script project.
