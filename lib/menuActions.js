import pc from 'picocolors';
import { showReadmeModal } from './modal.js';

// Menu Action: a non-agent entry in the picker. run() executes the action and returns
// a result telling pick()'s loop what to do next:
//   { type: 'again' } -> redraw the menu, cursor back on this action
//   { type: 'exit' }  -> stop picking, no agent chosen
export const MENU_ACTIONS = [
  {
    id: '__readme__',
    label: '📖 About / README',
    async run() {
      await showReadmeModal();
      return { type: 'again' };
    },
  },
  {
    id: '__cancel__',
    label: 'Cancel',
    async run() {
      console.log(pc.dim('Cancelled.'));
      return { type: 'exit' };
    },
  },
];
