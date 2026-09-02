import { readFileSync } from 'node:fs';
import pc from 'picocolors';

// Word-wrap a plain string to `width` columns, splitting on spaces.
function wrap(text, width) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && (line + ' ' + word).length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Minimal Markdown -> styled terminal lines. Handles #/##/### headings,
// fenced code blocks, and bullet lists — enough for a README, not a full parser.
// ponytail: covers only the Markdown subset agentpick's own README uses; upgrade to a real
// Markdown-to-ANSI renderer (e.g. marked-terminal) if richer docs need rendering later.
function renderMarkdown(md, width) {
  const out = [];
  let inCode = false;
  for (const raw of md.split('\n')) {
    if (raw.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      for (const line of wrap(raw, width)) out.push(pc.dim(pc.gray(line)));
      continue;
    }
    const heading = raw.match(/^(#{1,3})\s+(.*)/);
    if (heading) {
      const text = heading[1].length === 1 ? pc.bold(pc.cyan(heading[2])) : pc.bold(pc.magenta(heading[2]));
      out.push('', text);
      continue;
    }
    if (raw.trim().startsWith('- ')) {
      for (const line of wrap(raw.trim().slice(2), width - 2)) out.push(pc.green('•') + ' ' + line);
      continue;
    }
    if (raw.trim() === '') {
      out.push('');
      continue;
    }
    for (const line of wrap(raw, width)) out.push(line);
  }
  return out;
}

function waitForKey(message) {
  return new Promise((resolve) => {
    process.stdout.write(pc.dim(message));
    const { stdin } = process;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.once('data', () => {
      if (stdin.isTTY) stdin.setRawMode(wasRaw);
      stdin.pause();
      resolve();
    });
  });
}

// Show README.md as a full-screen modal: clear screen, draw a bordered box, wait for a
// keypress, then clear again so the caller can redraw whatever comes next.
export async function showReadmeModal() {
  const width = Math.min((process.stdout.columns || 80) - 4, 92);
  const text = readFileSync(new URL('../README.md', import.meta.url), 'utf8').trim();
  const lines = renderMarkdown(text, width);

  // Body lines are `│ ` + content(width) + ` │`, so the full box width is `width + 4`.
  // Build the title bar to that same total width so its corners line up with the sides.
  const boxWidth = width + 4;
  const title = ' 📖 agentpick ';
  const dashes = '─'.repeat(Math.max(0, boxWidth - 2 - title.length - 1));
  const top = pc.cyan('╭─') + pc.bold(title) + pc.cyan(dashes + '╮');
  const bottom = pc.cyan('╰' + '─'.repeat(boxWidth - 2) + '╯');

  console.clear();
  console.log(top);
  for (const line of lines) {
    const pad = ' '.repeat(Math.max(0, width - stripLen(line)));
    console.log(pc.cyan('│ ') + line + pad + pc.cyan(' │'));
  }
  console.log(bottom);
  await waitForKey('\n  Press any key to go back…');
  console.clear();
}

// Length of a string ignoring ANSI escape codes (picocolors output), for padding.
function stripLen(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}
