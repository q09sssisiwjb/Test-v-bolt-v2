import { type ActionFunctionArgs } from '@remix-run/cloudflare';

interface DeployRequest {
  githubUsername: string;
  repoName: string;
  vercelToken: string;
  githubRepoId: number;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body: DeployRequest = await request.json();
    const { githubUsername, repoName, vercelToken, githubRepoId } = body;

    if (!vercelToken || !repoName || !githubUsername || !githubRepoId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fullRepoName = `${githubUsername}/${repoName}`;
    const headers = {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    };

    let projectId;

    try {
      const projectsResponse = await fetch(`https://api.vercel.com/v9/projects/${repoName}`, {
        headers,
      });

      if (projectsResponse.ok) {
        const projectData = await projectsResponse.json() as any;
        projectId = projectData.id;
      }
    } catch (error) {
      console.log('Project not found, will create new one');
    }

    if (!projectId) {
      const createProjectResponse = await fetch('https://api.vercel.com/v9/projects', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: repoName,
          gitRepository: {
            type: 'github',
            repo: fullRepoName,
            repoId: githubRepoId,
          },
          framework: null,
        }),
      });

      if (!createProjectResponse.ok) {
        const errorData = await createProjectResponse.json() as any;
        return new Response(
          JSON.stringify({ 
            error: `Failed to create Vercel project: ${errorData.error?.message || createProjectResponse.statusText}` 
          }),
          { status: createProjectResponse.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const projectData = await createProjectResponse.json() as any;
      projectId = projectData.id;
    }

    const deployResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: repoName,
        project: projectId,
        gitSource: {
          type: 'github',
          repo: fullRepoName,
          ref: 'main',
        },
      }),
    });

    if (!deployResponse.ok) {
      const errorData = await deployResponse.json() as any;
      return new Response(
        JSON.stringify({ 
          error: `Vercel deployment failed: ${errorData.error?.message || deployResponse.statusText}` 
        }),
        { status: deployResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deployData = await deployResponse.json() as any;
    const deploymentUrl = `https://${deployData.url}`;

    return new Response(
      JSON.stringify({
        success: true,
        deploymentUrl,
        inspectorUrl: deployData.inspectorUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deploying to Vercel:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
