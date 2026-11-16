import type { ProjectDetailResponse } from '@/types/project';

export const canEditProject = (
  response: ProjectDetailResponse | undefined,
  isLoading: boolean,
  error: unknown,
): boolean => !isLoading && !error && response?.status === true && response.data?.isBlocked === false;
