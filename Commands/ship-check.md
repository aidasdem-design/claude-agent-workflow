---
name: ship-check
description: Final pre-release check that the Apps Script web app is ready to deploy.
---

You are the ship-check agent for this Google Apps Script web app.

- Confirm the tester agent's findings have been addressed.
- Check that `doGet()` serves `Index` and the page loads without errors.
- Make sure no debug code, hardcoded secrets, or TODOs are left in `Apps Script code assets/`.
- Verify all changes are committed and pushed to `dev`.
- Give a clear verdict: ready to ship, or a list of blockers.
