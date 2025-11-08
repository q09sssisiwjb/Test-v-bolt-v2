import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { Dialog, DialogRoot } from '~/components/ui/Dialog';
import { settingsStore, updateDeploymentCredentials } from '~/lib/stores/settings';
import { IconButton } from '~/components/ui/IconButton';
import WithTooltip from '~/components/ui/Tooltip';

interface DeploymentSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeploymentSettings({ isOpen, onClose }: DeploymentSettingsProps) {
  const settings = useStore(settingsStore);
  const [githubToken, setGithubToken] = useState(settings.deployment?.github?.token || '');
  const [githubUsername, setGithubUsername] = useState(settings.deployment?.github?.username || '');
  const [githubRepoName, setGithubRepoName] = useState(settings.deployment?.github?.repoName || '');
  const [vercelToken, setVercelToken] = useState(settings.deployment?.vercel?.token || '');

  const handleSave = () => {
    updateDeploymentCredentials({
      github: {
        token: githubToken,
        username: githubUsername,
        repoName: githubRepoName,
      },
      vercel: {
        token: vercelToken,
      },
    });
    onClose();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog onClose={onClose} className="max-w-2xl">
        <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-bolt-elements-textPrimary">Deployment Settings</h2>
          <button
            onClick={onClose}
            className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
          >
            <div className="i-ph:x text-xl" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="i-ph:warning text-yellow-500 text-xl flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <strong className="font-semibold">Security Warning:</strong> Tokens will be stored in your browser's localStorage. 
              Anyone with access to your browser can read these tokens. For production use, consider implementing a secure 
              server-side solution instead.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-b border-bolt-elements-borderColor pb-6">
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">GitHub Configuration</h3>
            <p className="text-sm text-bolt-elements-textSecondary mb-4">
              Configure your GitHub credentials to push code to your repository.{' '}
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Create a GitHub token
              </a>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="your-username"
                  className="w-full px-4 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={githubRepoName}
                  onChange={(e) => setGithubRepoName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full px-4 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-bolt-elements-textSecondary mt-1">
                  Required scopes: repo, workflow
                </p>
              </div>
            </div>
          </div>

          <div className="pb-6">
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">Vercel Configuration</h3>
            <p className="text-sm text-bolt-elements-textSecondary mb-4">
              Configure your Vercel token to deploy directly from GitHub.{' '}
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Create a Vercel token
              </a>
            </p>

            <div>
              <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                Vercel Access Token
              </label>
              <input
                type="password"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                placeholder="your-vercel-token"
                className="w-full px-4 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-bolt-elements-borderColor">
            <button
              onClick={onClose}
              className="px-4 py-2 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-1 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
        </div>
      </Dialog>
    </DialogRoot>
  );
}

export function DeploymentSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <WithTooltip tooltip="Deployment Settings">
        <IconButton onClick={() => setIsOpen(true)}>
          <div className="i-ph:gear text-xl" />
        </IconButton>
      </WithTooltip>
      <DeploymentSettings isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
