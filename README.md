# agentpick

Detect installed AI coding-agent CLIs on your machine and pick one to launch.

## Usage

```sh
npx agentpick
npx agentpick "fix the failing test"   # args are passed through to the chosen agent
```

- 0 agents detected -> prints supported agents + how to add a custom one
- 1 agent detected -> launches it directly, no menu
- 2+ agents detected -> interactive picker

## Supported agents

See `lib/registry.js` for the bundled list. Missing one? Add it yourself:

`~/.config/agentpick/config.json`:

```json
{
  "agents": [
    { "id": "my-agent", "label": "My Agent", "bin": "my-agent", "args": [] }
  ]
}
```

## Test

```sh
node test/detect.test.js
```
