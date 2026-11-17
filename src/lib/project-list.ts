import { type AdminProjectResponse, type AdminProjectSearchResponse } from '@/docs/api';
import { fetcher } from './fetcher';

export const PROJECT_LIST_KEY = '/api/project?page=1&size=100';
export interface ProjectListResult {
  status: true;
  data: AdminProjectSearchResponse;
}

export const loadProjectList = async (): Promise<ProjectListResult> => {
  const first = await fetcher(PROJECT_LIST_KEY);
  if (
    first?.status !== true ||
    !Array.isArray(first.data?.data) ||
    !Number.isInteger(first.data.allTotal) ||
    first.data.allTotal < 0
  ) {
    throw new Error('프로젝트 목록 응답을 확인할 수 없습니다.');
  }
  const total = first.data.allTotal;
  const size = first.data.size;
  const projects: AdminProjectResponse[] = [];
  const slugs = new Set<string>();
  const append = (items: AdminProjectResponse[]) => {
    for (const item of items) {
      if (!item.slug || slugs.has(item.slug)) throw new Error('조회 중 목록이 변경되었습니다. 다시 시도해주세요.');
      slugs.add(item.slug);
      projects.push(item);
    }
    if (projects.length > total) throw new Error('프로젝트 집계를 확인할 수 없습니다.');
  };
  append(first.data.data);
  if (projects.length < total && (!Number.isInteger(size) || size < 1 || projects.length === 0)) {
    throw new Error('전체 프로젝트를 불러오지 못했습니다.');
  }
  for (let page = 2; projects.length < total; page += 1) {
    const response = await fetcher(`/api/project?page=${page}&size=${size}`);
    if (
      response?.status !== true ||
      response.data?.allTotal !== total ||
      !Array.isArray(response.data.data) ||
      response.data.data.length === 0
    ) {
      throw new Error('전체 프로젝트를 불러오지 못했습니다.');
    }
    append(response.data.data);
  }
  return {
    status: true,
    data: { ...first.data, data: projects, total, filteredTotal: total, page: 1, size: projects.length },
  };
};
