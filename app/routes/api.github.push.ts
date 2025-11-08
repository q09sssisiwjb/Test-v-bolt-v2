import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Octokit, type RestEndpointMethodTypes } from '@octokit/rest';

interface PushRequest {
  repoName: string;
  githubUsername: string;
  githubToken: string;
  files: Record<string, { type: string; content: string }>;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body: PushRequest = await request.json();
    const { repoName, githubUsername, githubToken, files } = body;

    if (!githubToken || !repoName || !githubUsername) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const octokit = new Octokit({ auth: githubToken });
    const owner = githubUsername;

    let repo: RestEndpointMethodTypes['repos']['get']['response']['data'];

    try {
      const resp = await octokit.repos.get({ owner, repo: repoName });
      repo = resp.data;
    } catch (error: any) {
      if (error.status === 404) {
        const { data: newRepo } = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          private: false,
          auto_init: true,
        });
        repo = newRepo;
      } else {
        throw error;
      }
    }

    if (!files || Object.keys(files).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files found to push' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const base64Encode = (str: string): string => {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const binString = Array.from(data, (byte) => String.fromCodePoint(byte)).join('');
      return btoa(binString);
    };

    const blobs = await Promise.all(
      Object.entries(files).map(async ([filePath, dirent]) => {
        if (dirent?.type === 'file' && dirent.content) {
          const relativePath = filePath.replace(/^\/home\/project\//, '');
          const { data: blob } = await octokit.git.createBlob({
            owner: repo.owner.login,
            repo: repo.name,
            content: base64Encode(dirent.content),
            encoding: 'base64',
          });
          return { path: relativePath, sha: blob.sha };
        }
        return null;
      })
    );

    const validBlobs = blobs.filter(Boolean);

    if (validBlobs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid files to push' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: ref } = await octokit.git.getRef({
      owner: repo.owner.login,
      repo: repo.name,
      ref: `heads/${repo.default_branch || 'main'}`,
    });
    const latestCommitSha = ref.object.sha;

    const { data: newTree } = await octokit.git.createTree({
      owner: repo.owner.login,
      repo: repo.name,
      base_tree: latestCommitSha,
      tree: validBlobs.map((blob) => ({
        path: blob!.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob!.sha,
      })),
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner: repo.owner.login,
      repo: repo.name,
      message: 'Update from AI code generator',
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    await octokit.git.updateRef({
      owner: repo.owner.login,
      repo: repo.name,
      ref: `heads/${repo.default_branch || 'main'}`,
      sha: newCommit.sha,
    });

    return new Response(
      JSON.stringify({
        success: true,
        repoUrl: repo.html_url,
        repoId: repo.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
