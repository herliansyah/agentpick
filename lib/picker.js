import { SelectPrompt, isCancel } from '@clack/core';
import pc from 'picocolors';

const RADIO_ACTIVE = '●';
const RADIO_INACTIVE = '○';
const BAR = '│';

// Thin wrapper around @clack/core's SelectPrompt with our own row renderer, so a
// `separator: true` option renders as plain dim text with no radio bullet — unlike
// @clack/prompts' built-in select(), which always draws a bullet even when disabled.
export async function selectWithSeparators({ message, options, initialValue }) {
  const prompt = new SelectPrompt({
    options,
    initialValue,
    render() {
      const lines = [pc.cyan('┌  ') + pc.bold(message), pc.cyan(BAR)];
      for (let i = 0; i < this.options.length; i++) {
        const opt = this.options[i];
        const label = opt.label ?? String(opt.value);
        if (opt.separator) {
          lines.push(pc.cyan(BAR) + '  ' + pc.dim(label));
        } else if (i === this.cursor) {
          lines.push(pc.cyan(BAR) + '  ' + pc.green(RADIO_ACTIVE) + ' ' + label);
        } else {
          lines.push(pc.cyan(BAR) + '  ' + pc.dim(RADIO_INACTIVE) + ' ' + pc.dim(label));
        }
      }
      lines.push(pc.cyan('└'));
      return lines.join('\n');
    },
  });
  return prompt.prompt();
}

export { isCancel };
