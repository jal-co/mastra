import { beforeEach, describe, expect, it } from 'vitest';

import { SourceControlStorageInMemory } from '../../storage/domains/source-control/inmemory.js';
import { allocateUserSessionBranch } from './user-session-names.js';

describe('allocateUserSessionBranch', () => {
  let sourceControl: SourceControlStorageInMemory;
  let projectRepositoryId: string;
  let sessionSequence: number;

  beforeEach(async () => {
    sourceControl = new SourceControlStorageInMemory();
    const installation = await sourceControl.installations.upsert({
      orgId: 'org-1',
      connectedByUserId: 'user-1',
      externalId: 'installation-1',
    });
    const repository = await sourceControl.repositories.upsert({
      orgId: 'org-1',
      input: {
        installationId: installation.id,
        externalId: 'repository-1',
        slug: 'mastra-ai/mastra',
        defaultBranch: 'main',
      },
    });
    const connection = await sourceControl.connections.create({
      orgId: 'org-1',
      factoryProjectId: 'factory-1',
      installationId: installation.id,
      createdByUserId: 'user-1',
    });
    const projectRepository = await sourceControl.projectRepositories.link({
      orgId: 'org-1',
      connectionId: connection.id,
      repositoryId: repository.id,
      createdByUserId: 'user-1',
      sandboxProvider: 'local',
      sandboxWorkdir: '/workspace/mastra',
    });
    projectRepositoryId = projectRepository.id;
    sessionSequence = 0;
  });

  const allocate = (userId = 'user-1') => {
    sessionSequence += 1;
    const sessionId = `00000000-0000-4000-8000-${String(sessionSequence).padStart(12, '0')}`;
    return allocateUserSessionBranch({ sourceControl, projectRepositoryId, userId, sessionId });
  };

  const createSession = (branch: string) =>
    sourceControl.sessions.create({
      sessionId: `sess-${branch}`,
      projectRepositoryId,
      orgId: 'org-1',
      userId: 'user-1',
      branch,
      baseBranch: 'main',
    });

  it('starts at one', async () => {
    expect(await allocate()).toBe('user/session-1-00000000-0000-4000-8000-000000000001');
  });

  it('does not let explicit generated-style names advance the counter', async () => {
    await createSession('user/session-999999998');

    expect(await allocate()).toBe('user/session-1-00000000-0000-4000-8000-000000000001');
  });

  it('does not come back around after the highest session is deleted', async () => {
    const generated = await allocate();
    expect(generated).toBe('user/session-1-00000000-0000-4000-8000-000000000001');
    const created = await createSession(generated);

    await sourceControl.sessions.delete(created.id);

    expect(await allocate()).toBe('user/session-2-00000000-0000-4000-8000-000000000002');
  });

  it('cannot reopen a deleted branch created before the counter existed', async () => {
    const created = await createSession('user/session-1');
    await sourceControl.sessions.delete(created.id);

    expect(await allocate()).toBe('user/session-1-00000000-0000-4000-8000-000000000001');
  });

  it('ignores branches that are not generated names', async () => {
    await createSession('user/login-bug');
    await createSession('factory/pr-900');

    expect(await allocate()).toBe('user/session-1-00000000-0000-4000-8000-000000000001');
  });

  it('does not exhaust the counter from an explicit name at its ceiling', async () => {
    await createSession('user/session-999999999');

    expect(await allocate()).toBe('user/session-1-00000000-0000-4000-8000-000000000001');
  });

  it('gives different users distinct branches while numbering each user independently', async () => {
    const first = await allocate('user-1');
    const second = await allocate('user-2');

    expect(first).toBe('user/session-1-00000000-0000-4000-8000-000000000001');
    expect(second).toBe('user/session-1-00000000-0000-4000-8000-000000000002');
  });

  it('rejects an unknown repository link', async () => {
    await expect(
      allocateUserSessionBranch({
        sourceControl,
        projectRepositoryId: 'missing',
        userId: 'user-1',
        sessionId: '00000000-0000-4000-8000-000000000001',
      }),
    ).rejects.toThrow('Source-control repository not found');
  });
});
