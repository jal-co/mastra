import type { SourceControlStorageHandle } from '../../storage/domains/source-control/base.js';

const USER_SESSION_BRANCH_PREFIX = 'user/';

/** Allocates a durable display index and a collision-free Git branch. */
export async function allocateUserSessionBranch(args: {
  sourceControl: Pick<SourceControlStorageHandle, 'userSessionNames'>;
  projectRepositoryId: string;
  userId: string;
  sessionId: string;
}): Promise<string> {
  const { sourceControl, projectRepositoryId, userId, sessionId } = args;
  const index = await sourceControl.userSessionNames.allocate({
    projectRepositoryId,
    userId,
    atLeast: 1,
  });
  return `${USER_SESSION_BRANCH_PREFIX}session-${index}-${sessionId}`;
}
