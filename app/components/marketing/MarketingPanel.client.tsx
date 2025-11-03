import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { marketingStore, closeMarketing, setMarketingContent, setMarketingGenerating, setMarketingError } from '~/lib/stores/marketing';
import { workbenchStore } from '~/lib/stores/workbench';
import { Markdown } from '~/components/chat/Markdown';
import * as Dialog from '@radix-ui/react-dialog';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { parseStreamPart } from 'ai';

export function MarketingPanel() {
  const { isOpen, isGenerating, content, error } = useStore(marketingStore);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && !hasGenerated && !content && !isGenerating) {
      generateMarketingStrategy();
    }
  }, [isOpen]);

  const generateMarketingStrategy = async () => {
    try {
      setMarketingGenerating(true);
      setMarketingError(null);
      setMarketingContent('');

      const files = workbenchStore.files.get();
      const fileContents = Object.entries(files).map(([path, dirent]) => {
        if (dirent?.type === 'file' && dirent.content) {
          return `File: ${path}\n\`\`\`\n${dirent.content}\n\`\`\`\n`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const cookieHeader = document.cookie;
      const cookies: Record<string, string> = {};
      
      if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
          const [name, ...rest] = cookie.trim().split('=');
          if (name && rest.length > 0) {
            cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join('='));
          }
        });
      }

      const apiKeys = JSON.parse(cookies.apiKeys || '{}');

      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileContents,
          apiKeys,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate marketing strategy');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = parseStreamPart(line);

            if (parsed.type === 'text') {
              accumulatedContent += parsed.value;
              setMarketingContent(accumulatedContent);
            }
          } catch (e) {
            console.warn('Failed to parse stream part:', line);
          }
        }
      }

      setHasGenerated(true);
      setMarketingGenerating(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate marketing strategy';
      setMarketingError(errorMessage);
      setMarketingGenerating(false);
      toast.error(errorMessage);
    }
  };

  const handleRegenerateWithContext = async (context: string) => {
    try {
      setMarketingGenerating(true);
      setMarketingError(null);

      const files = workbenchStore.files.get();
      const fileContents = Object.entries(files).map(([path, dirent]) => {
        if (dirent?.type === 'file' && dirent.content) {
          return `File: ${path}\n\`\`\`\n${dirent.content}\n\`\`\`\n`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const cookieHeader = document.cookie;
      const cookies: Record<string, string> = {};
      
      if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
          const [name, ...rest] = cookie.trim().split('=');
          if (name && rest.length > 0) {
            cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join('='));
          }
        });
      }

      const apiKeys = JSON.parse(cookies.apiKeys || '{}');

      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileContents,
          apiKeys,
          additionalContext: context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate marketing strategy');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = parseStreamPart(line);

            if (parsed.type === 'text') {
              accumulatedContent += parsed.value;
              setMarketingContent(accumulatedContent);
            }
          } catch (e) {
            console.warn('Failed to parse stream part:', line);
          }
        }
      }

      setMarketingGenerating(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate marketing strategy';
      setMarketingError(errorMessage);
      setMarketingGenerating(false);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeMarketing()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg shadow-xl z-50 w-[90vw] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
            <div className="flex items-center gap-3">
              <div className="i-ph:megaphone-simple text-2xl text-bolt-elements-textPrimary" />
              <Dialog.Title className="text-xl font-semibold text-bolt-elements-textPrimary">
                Marketing Strategy & Growth Plan
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <IconButton title="Close">
                <div className="i-ph:x text-xl" />
              </IconButton>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isGenerating && !content && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="i-svg-spinners:90-ring-with-bg text-4xl text-bolt-elements-loader-progress" />
                <p className="text-bolt-elements-textSecondary">Analyzing your app and generating comprehensive marketing strategies...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                <p className="font-semibold">Error generating marketing strategy</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={generateMarketingStrategy}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {content && (
              <div className="prose prose-invert max-w-none">
                <Markdown html>{content}</Markdown>
                
                {!isGenerating && (
                  <div className="mt-8 pt-6 border-t border-bolt-elements-borderColor">
                    <button
                      onClick={generateMarketingStrategy}
                      className="px-4 py-2 bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded-lg transition-colors mr-3"
                    >
                      Regenerate Strategy
                    </button>
                  </div>
                )}

                {isGenerating && content && (
                  <div className="flex items-center gap-2 mt-4 text-bolt-elements-textSecondary">
                    <div className="i-svg-spinners:90-ring-with-bg text-xl" />
                    <span>Generating...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
