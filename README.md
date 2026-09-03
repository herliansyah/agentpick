# 🎯 agentpick

Detect installed AI coding-agent CLIs on your machine and pick one to launch.

## Usage

```sh
npx agentpick
npx agentpick "fix the failing test"   # args are passed through to the chosen agent
```

- 0 agents detected: prints supported list and custom config instructions
- 1 agent detected: launches it immediately without menu prompt
- 2+ agents detected: interactive terminal picker

## Configuration

Add or override agents in `~/.config/agentpick/config.json`:

```json
{
  "agents": [
    { "id": "my-agent", "label": "My Agent", "bin": "my-agent", "args": [] }
  ]
}
```

<!-- cli-end -->

---

## 🌟 Features

- ⚡ **Zero Setup**: Run instantly via `npx agentpick` without pre-installing.
- 🔍 **Auto-Detection**: Probes your system's `PATH` for installed AI agent CLI binaries.
- 🚀 **Smart Launching**:
  - Automatically launches the agent if only one is installed.
  - Opens a clean interactive terminal menu if multiple agents are detected.
  - Helpful suggestions if no agents are found.
- 💬 **Argument Passthrough**: Any trailing arguments or prompts are passed directly to the chosen agent (e.g. `npx agentpick "explain this function"`).
- 🛠️ **Extensible Registry**: Add custom binaries, proprietary agents, or default CLI arguments via a simple JSON config file.

---

## 📦 Supported Agents (Bundled Registry)

`agentpick` checks for these CLI tools out of the box:

| Agent | Binary (`bin`) |
| --- | --- |
| **Claude Code** | `claude` |
| **Codex CLI** | `codex` |
| **opencode** | `opencode` |
| **omp** | `omp` |
| **pi** | `pi` |
| **Prime Agent** | `prime-agent` |
| **Aider** | `aider` |
| **Gemini CLI** | `gemini` |
| **Continue** | `cn` |
| **Goose** | `goose` |
| **Cursor Agent** | `cursor-agent` |
| **GitHub Copilot CLI** | `copilot` |
| **Amazon Q Developer** | `q` |
| **Sourcegraph Cody** | `cody` |
| **Hermes** | `hermes` |
| **Antigravity** | `agy` |
| **Poolside** | `pool` |
| **Forge** | `forge` |
| **CodeWhale** | `codewhale` |
| **Command Code** | `cmdc` |
| **Freebuff** | `freebuff` |
| **Reasonix** | `reasonix` |
| **Kilo** | `kilo` |
| **Crush** | `crush` |
| **Droid** | `droid` |

---

## 🇮🇩 Bahasa Indonesia

### Tentang agentpick

**agentpick** adalah CLI launcher ringan untuk mendeteksi *AI coding-agent* yang sudah terinstall di komputer Anda dan memilih salah satunya untuk dijalankan.

Jika Anda menggunakan beberapa coding assistant sekaligus (misalnya Claude Code untuk arsitektur, Aider untuk refactor cepat, atau Cursor Agent di terminal), `agentpick` memudahkan Anda berganti agent tanpa harus mengingat nama binary masing-masing.

### Cara Penggunaan

Cukup jalankan via `npx`:

```sh
# Buka menu pemilihan agent interaktif
npx agentpick

# Jalankan agent terpilih dengan prompt langsung
npx agentpick "perbaiki unit test yang gagal"
```

### Logika Deteksi

- **0 Agent Terdeteksi**: Menampilkan daftar agent yang didukung serta panduan konfigurasi agent kustom.
- **1 Agent Terdeteksi**: Langsung meluncurkan agent tersebut tanpa menampilkan menu.
- **2+ Agent Terdeteksi**: Menampilkan menu pemilihan (*interactive picker*) terminal.

### Menambahkan Agent Kustom

Jika agent yang Anda pakai belum ada di daftar bawaan, Anda dapat menambahkannya di `~/.config/agentpick/config.json`:

```json
{
  "agents": [
    { "id": "nama-agent", "label": "Nama Agent", "bin": "nama-binary", "args": [] }
  ]
}
```

---

## Development & Test

Run the test suite:

```sh
node test/detect.test.js
```

## License

MIT

