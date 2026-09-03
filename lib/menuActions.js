import pc from 'picocolors';
import { showReadmeModal } from './modal.js';

// Menu Action: a non-agent entry in the picker. run() executes the action and returns
// a result telling pick()'s loop what to do next:
//   { type: 'again' } -> redraw the menu, cursor back on this action
//   { type: 'exit' }  -> stop picking, no agent chosen
export const MENU_ACTIONS = [
  {
    id: '__help__',
    label: 'Help',
    async run() {
      await showReadmeModal();
      return { type: 'again' };
    },
  },
  {
    id: '__exit__',
    label: 'Exit',
    async run() {
      console.log(pc.dim('Exited.'));
      return { type: 'exit' };
    },
  },
];
