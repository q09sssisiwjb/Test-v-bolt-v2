import { memo } from 'react';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';

interface VercelDeploymentDialogProps {
  open: boolean;
  onClose: () => void;
  deploymentUrl: string;
  projectName: string;
  username: string;
}

export const VercelDeploymentDialog = memo(
  ({ open, onClose, deploymentUrl, projectName, username }: VercelDeploymentDialogProps) => {
    const dashboardUrl = `https://vercel.com/${username}/${projectName}`;

    const handleOpenDeployment = () => {
      window.open(deploymentUrl, '_blank', 'noopener,noreferrer');
    };

    const handleOpenDashboard = () => {
      window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
      onClose();
    };

    return (
      <DialogRoot open={open}>
        <Dialog onClose={onClose}>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <div className="i-ph:check-circle text-green-500 text-2xl" />
              Deployment Successful!
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <p>Your website has been successfully deployed to Vercel!</p>
              
              <div className="bg-bolt-elements-background-depth-3 rounded-lg p-3 break-all">
                <p className="text-sm text-bolt-elements-textSecondary mb-1">Deployment URL:</p>
                <a 
                  href={deploymentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bolt-elements-link hover:underline text-sm"
                >
                  {deploymentUrl}
                </a>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <DialogButton type="primary" onClick={handleOpenDashboard}>
                  <div className="flex items-center gap-2">
                    <div className="i-ph:arrow-square-out" />
                    Open Vercel Dashboard
                  </div>
                </DialogButton>
                <DialogButton type="secondary" onClick={handleOpenDeployment}>
                  <div className="flex items-center gap-2">
                    <div className="i-ph:globe" />
                    Visit Deployed Site
                  </div>
                </DialogButton>
              </div>
            </div>
          </DialogDescription>
        </Dialog>
      </DialogRoot>
    );
  },
);
