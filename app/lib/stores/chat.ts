import { map } from 'nanostores';

export const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
  pendingInput: '',
});

export function setPendingInput(input: string) {
  chatStore.setKey('pendingInput', input);
  chatStore.setKey('showChat', true);
}
