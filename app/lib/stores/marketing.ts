import { map } from 'nanostores';

export interface MarketingState {
  isOpen: boolean;
  isGenerating: boolean;
  content: string;
  error: string | null;
}

export const marketingStore = map<MarketingState>({
  isOpen: false,
  isGenerating: false,
  content: '',
  error: null,
});

export function openMarketing() {
  marketingStore.setKey('isOpen', true);
}

export function closeMarketing() {
  marketingStore.setKey('isOpen', false);
}

export function setMarketingContent(content: string) {
  marketingStore.setKey('content', content);
}

export function setMarketingGenerating(isGenerating: boolean) {
  marketingStore.setKey('isGenerating', isGenerating);
}

export function setMarketingError(error: string | null) {
  marketingStore.setKey('error', error);
}
