import { useParams } from 'react-router';

import { useChatConnection } from '../context/useChatConnection';
import { useChatSessionContext } from '../context/useChatSessionContext';

/**
 * Route thread whose session is not online yet — the composer holds messages
 * for it instead of going dead, and the status line names the wait. One gate
 * for both: a composer that takes a message the status line never explains
 * reads as a message that went nowhere.
 */
export function usePreparingThreadId(): string | null {
  const { sessionEnabled } = useChatSessionContext();
  const { status } = useChatConnection();
  const { threadId } = useParams<{ threadId: string }>();
  return threadId && sessionEnabled && status === 'connecting' ? threadId : null;
}
