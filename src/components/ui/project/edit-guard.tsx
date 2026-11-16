import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { canEditProject } from '@/lib/project-edit-policy';
import type { ProjectDetailResponse } from '@/types/project';
import type { ReactNode } from 'react';

interface ProjectEditGuardProps {
  response: ProjectDetailResponse | undefined;
  isLoading: boolean;
  error: unknown;
  children: ReactNode;
}

export function ProjectEditGuard({ response, isLoading, error, children }: ProjectEditGuardProps) {
  if (isLoading || (!response && !error)) {
    return (
      <div role="status">
        <p className="mb-4 text-sm text-gray-500">프로젝트 정보를 불러오는 중입니다.</p>
        <Skeleton />
      </div>
    );
  }
  if (error || response?.status !== true) {
    return <p role="alert">프로젝트 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</p>;
  }
  const project = response.data;
  if (!project) return <p role="alert">프로젝트를 찾을 수 없습니다.</p>;
  if (project.isBlocked === true) {
    return (
      <section className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
        <div role="status" className="space-y-3">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            자동 동기화 · 읽기 전용
          </span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{project.title}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            콘텐츠는 연결된 저장소에서 수정해주세요. 변경 내용은 자동으로 동기화됩니다.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            게시·숨김, 순서 변경, 삭제는 목록에서 계속 관리할 수 있습니다.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-blue-700 dark:text-blue-300">
          <Link href="/project" className="underline underline-offset-4">
            목록으로 돌아가기
          </Link>
          <Link href={`/project/preview/${project.slug}`} className="underline underline-offset-4">
            프로젝트 미리보기
          </Link>
          {project.linkGithub && (
            <a href={project.linkGithub} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              저장소 열기
            </a>
          )}
        </div>
      </section>
    );
  }
  if (!canEditProject(response, isLoading, error))
    return <p role="alert">프로젝트 편집 상태를 확인할 수 없습니다. 새로고침 후 다시 시도해주세요.</p>;
  return children;
}
