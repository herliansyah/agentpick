# Spec: Interactive Agent Profile Manager

Allow users to create and manage custom Agent Profiles (e.g. `Antigravity` with `--dangerously-skip-permissions` and other parameters) directly from `agentpick` terminal interface without editing JSON manually.

## Background
Users frequently need to run coding agents (like `agy`) with specific sets of flags, such as `--dangerously-skip-permissions` or custom flags, while also retaining the ability to run the agent with default settings. Currently, this requires manually editing `~/.config/agentpick/config.json`.

## Requirements
1. **Interactive Profile Management**:
   - Accessible via main menu action `Manage Profiles` (in `MENU_ACTIONS`) and CLI command `agentpick config` / `agentpick --manage`.
   - Options to:
     - **Add Profile**: Select base agent, pick popular/curated flags via multi-select checklist (e.g. `--dangerously-skip-permissions`, `--verbose`), optionally type custom flags, specify custom display label.
     - **Delete Profile**: Select an existing user profile from `config.json` and remove it with confirmation.
2. **Storage**:
   - Persist profiles directly to `~/.config/agentpick/config.json` in the existing `{ "agents": [...] }` schema.
   - Automatically generate unique `id` for profiles (e.g. `slug(label)` or `baseId-<flag-slug>`).
3. **Menu Integration**:
   - Newly added or deleted profiles immediately reflect in `agentpick`'s main interactive picker upon returning to the menu.
4. **Curated Known Flags**:
   - Curated dictionary of popular flags for common agents (e.g. `agy`: `--dangerously-skip-permissions`, `--verbose`, etc.).
