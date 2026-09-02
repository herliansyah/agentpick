import { accessSync, constants } from 'node:fs';
import { delimiter, join } from 'node:path';

const isWindows = process.platform === 'win32';
// ponytail: fixed common Windows executable extensions; upgrade to reading %PATHEXT% if a bin needs one not listed here.
const WIN_EXTS = ['.exe', '.cmd', '.bat', ''];

// Probe: check whether `bin` resolves to an executable file on PATH. Returns the resolved path or null.
export function probe(bin) {
  const dirs = (process.env.PATH || '').split(delimiter).filter(Boolean);
  const exts = isWindows ? WIN_EXTS : [''];
  for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = join(dir, bin + ext);
      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {
        // not here, keep looking
      }
    }
  }
  return null;
}
