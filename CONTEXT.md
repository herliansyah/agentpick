# agentpick

CLI launcher that detects installed AI coding-agent CLIs on the machine and lets the user pick one to run.

## Language

**Agent**:
An installed AI coding-agent CLI (e.g. Claude Code, opencode, codex) that agentpick can launch.
_Avoid_: Tool, assistant, provider

**Registry**:
The curated list bundled with agentpick mapping each known Agent to its binary name and default invoke args.
_Avoid_: Database, catalog

**Probe**:
The act of checking whether an Agent's binary exists on the current machine's PATH.
_Avoid_: Check, scan, detect (detect is the overall process; probe is the per-agent PATH lookup)

**Detected Agent**:
An Agent from the Registry (or user config) whose Probe succeeded on this machine.
_Avoid_: Available agent, installed agent

**User Registry Override**:
Entries a user adds or overrides in `~/.config/agentpick/config.json`, merged with the bundled Registry.
_Avoid_: Custom agent, plugin
