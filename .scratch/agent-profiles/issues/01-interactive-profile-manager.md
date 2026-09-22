# Issue 01: Implement Interactive Agent Profile Manager

Status: resolved

## Description
Implement the interactive agent profile management workflow in `agentpick`:
1. Add `lib/profiles.js` with functions to:
   - Manage user config (load, save, add, remove profiles in `~/.config/agentpick/config.json`)
   - Curated list of known flags for popular agents (e.g. `agy`, `claude`, etc.)
   - Clack prompt flow for "Add Profile" (select base agent, multiselect flags, label, save) and "Delete Profile".
2. Integrate into `lib/menuActions.js`:
   - Add `Manage Profiles` action that invokes the profile manager and returns `{ type: 'again' }` to reload the picker.
3. Support CLI subcommands `agentpick config` / `agentpick --manage` in `bin/cli.js`.
4. Ensure tests and ponytail simplifications are present.

## Answer
Implemented interactive Agent Profile Manager:
- `lib/profiles.js`: Provides `manageProfilesInteractive`, `saveProfile`, `deleteProfile`, and `KNOWN_FLAGS` for agents including `agy` with `--dangerously-skip-permissions`.
- `lib/menuActions.js`: Added `Manage Profiles` menu action.
- `bin/cli.js`: Added direct access via `agentpick config`, `agentpick --manage`, and auto-refresh on returning from profile manager.
- `test/profiles.test.js`: Runnable assert-based test for profile persistence and flag lookup.
- `CONTEXT.md` & `README.md`: Updated domain terms and documentation.

