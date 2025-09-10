import { useContext } from 'react';
import { DiscussionsContext } from './discussionsData';

export function useDiscussions() {
  const ctx = useContext(DiscussionsContext);
  if (!ctx) throw new Error('useDiscussions must be used within DiscussionsProvider');
  return ctx;
}

export default useDiscussions;
