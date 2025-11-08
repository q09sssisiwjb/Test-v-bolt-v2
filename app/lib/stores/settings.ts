import { map } from 'nanostores';
import { workbenchStore } from './workbench';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
}

export interface Shortcuts {
  toggleTerminal: Shortcut;
}

export interface DeploymentCredentials {
  github: {
    token: string;
    username: string;
    repoName: string;
    repoId?: number;
  };
  vercel: {
    token: string;
  };
}

export interface Settings {
  shortcuts: Shortcuts;
  deployment?: DeploymentCredentials;
}

export const shortcutsStore = map<Shortcuts>({
  toggleTerminal: {
    key: 'j',
    ctrlOrMetaKey: true,
    action: () => workbenchStore.toggleTerminal(),
  },
});

const loadDeploymentCredentials = (): DeploymentCredentials | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const stored = localStorage.getItem('deployment_credentials');
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
};

export const settingsStore = map<Settings>({
  shortcuts: shortcutsStore.get(),
  deployment: loadDeploymentCredentials(),
});

shortcutsStore.subscribe((shortcuts) => {
  settingsStore.set({
    ...settingsStore.get(),
    shortcuts,
  });
});

export const updateDeploymentCredentials = (credentials: Partial<DeploymentCredentials>) => {
  const current = settingsStore.get().deployment || {
    github: { token: '', username: '', repoName: '', repoId: undefined },
    vercel: { token: '' },
  };

  const updated = {
    github: { ...current.github, ...credentials.github },
    vercel: { ...current.vercel, ...credentials.vercel },
  };

  settingsStore.setKey('deployment', updated);

  if (typeof window !== 'undefined') {
    localStorage.setItem('deployment_credentials', JSON.stringify(updated));
  }
};

export const setGitHubRepoId = (repoId: number) => {
  const current = settingsStore.get().deployment;
  if (current) {
    updateDeploymentCredentials({
      github: { ...current.github, repoId },
    });
  }
};

export const hasGitHubCredentials = (): boolean => {
  const deployment = settingsStore.get().deployment;
  return !!(deployment?.github?.token && deployment?.github?.username && deployment?.github?.repoName);
};

export const hasVercelCredentials = (): boolean => {
  const deployment = settingsStore.get().deployment;
  return !!(deployment?.vercel?.token);
};
