import { useStore } from '@nanostores/react';
import { useState } from 'react';
import useViewport from '~/lib/hooks';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { settingsStore, hasGitHubCredentials, hasVercelCredentials, setGitHubRepoId } from '~/lib/stores/settings';
import { classNames } from '~/utils/classNames';
import { DeploymentSettingsButton } from './DeploymentSettings.client';
import WithTooltip from '~/components/ui/Tooltip';
import { toast } from 'react-toastify';
import { VercelDeploymentDialog } from '~/components/deployment/VercelDeploymentDialog';

interface HeaderActionButtonsProps {}

export function HeaderActionButtons({}: HeaderActionButtonsProps) {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);
  const settings = useStore(settingsStore);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeploymentDialog, setShowDeploymentDialog] = useState(false);
  const [deploymentData, setDeploymentData] = useState<{ deploymentUrl: string; projectName: string; username: string } | null>(null);

  const isSmallViewport = useViewport(1024);
  const canHideChat = showWorkbench || !showChat;
  const hasGithubCreds = hasGitHubCredentials();
  const hasVercelCreds = hasVercelCredentials();

  const handlePushToGitHub = async () => {
    if (!settings.deployment) return;
    
    setIsDeploying(true);
    try {
      const result = await workbenchStore.pushToGitHub(
        settings.deployment.github.repoName,
        settings.deployment.github.username,
        settings.deployment.github.token
      );
      
      if (result && result.repoId) {
        setGitHubRepoId(result.repoId);
      }
      
      toast.success('Successfully pushed to GitHub!');
    } catch (error) {
      toast.error('Failed to push to GitHub: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeployToVercel = async () => {
    if (!settings.deployment) return;
    
    if (!settings.deployment.github.repoId) {
      toast.error('Please push to GitHub first before deploying to Vercel');
      return;
    }
    
    setIsDeploying(true);
    try {
      const result = await workbenchStore.deployToVercel(
        settings.deployment.github.username,
        settings.deployment.github.repoName,
        settings.deployment.vercel.token,
        settings.deployment.github.repoId
      );
      
      if (result && result.deploymentUrl) {
        setDeploymentData({
          deploymentUrl: result.deploymentUrl,
          projectName: settings.deployment.github.repoName,
          username: settings.deployment.github.username,
        });
        setShowDeploymentDialog(true);
        toast.success('Successfully deployed to Vercel!');
      }
    } catch (error) {
      toast.error('Failed to deploy to Vercel: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      {deploymentData && (
        <VercelDeploymentDialog
          open={showDeploymentDialog}
          onClose={() => setShowDeploymentDialog(false)}
          deploymentUrl={deploymentData.deploymentUrl}
          projectName={deploymentData.projectName}
          username={deploymentData.username}
        />
      )}
      
      <div className="flex gap-2">
        {hasGithubCreds && (
        <WithTooltip tooltip="Push to GitHub">
          <button
            onClick={handlePushToGitHub}
            disabled={isDeploying}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-md border border-bolt-elements-borderColor disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="i-ph:git-branch text-lg" />
            <span className="text-sm">Push</span>
          </button>
        </WithTooltip>
      )}
      
      {hasVercelCreds && hasGithubCreds && (
        <WithTooltip tooltip="Deploy to Vercel">
          <button
            onClick={handleDeployToVercel}
            disabled={isDeploying}
            className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-gray-900 text-white rounded-md border border-bolt-elements-borderColor disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="i-ph:triangle text-lg" />
            <span className="text-sm">Vercel</span>
          </button>
        </WithTooltip>
      )}
      
      <DeploymentSettingsButton />
      
      <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden">
        <Button
          active={showChat}
          disabled={!canHideChat || isSmallViewport}
          onClick={() => {
            if (canHideChat) {
              chatStore.setKey('showChat', !showChat);
            }
          }}
        >
          <div className="i-bolt:chat text-sm" />
        </Button>
        <div className="w-[1px] bg-bolt-elements-borderColor" />
        <Button
          active={showWorkbench}
          onClick={() => {
            if (showWorkbench && !showChat) {
              chatStore.setKey('showChat', true);
            }

            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <div className="i-ph:code-bold" />
        </Button>
      </div>
      </div>
    </>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
}

function Button({ active = false, disabled = false, children, onClick }: ButtonProps) {
  return (
    <button
      className={classNames('flex items-center p-1.5', {
        'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
          !active,
        'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': active && !disabled,
        'bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
          disabled,
      })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
