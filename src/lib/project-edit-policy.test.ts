import { describe, expect, it } from 'vitest';
import { ProjectSource } from '@/docs/api';
import { canEditProject } from './project-edit-policy';
import type { ProjectDetailResponse } from '@/types/project';
const response = (isBlocked: boolean): ProjectDetailResponse => ({
  status: true,
  data: {
    id: 1,
    source: ProjectSource.Company,
    isBlocked,
    slug: 'company',
    title: '회사 프로젝트',
    description: '',
    image: '',
    stacks: '[]',
    content: '',
    isShow: true,
    linkDemo: '',
    linkGithub: '',
    order: 1,
    updatedAt: '2026-11-16',
  },
});
describe('프로젝트 편집 허용', () => {
  it('성공한 조회가 명시적으로 편집을 허용한 경우에만 활성화한다', () => {
    expect(canEditProject(response(false), false, undefined)).toBe(true);
    expect(canEditProject(response(true), false, undefined)).toBe(false);
  });
  it('로딩·오류·응답 실패·없는 항목·정책 누락이면 비활성화한다', () => {
    expect(canEditProject(response(false), true, undefined)).toBe(false);
    expect(canEditProject(response(false), false, new Error('fixture'))).toBe(false);
    expect(canEditProject(undefined, false, undefined)).toBe(false);
    expect(canEditProject({ status: false }, false, undefined)).toBe(false);
    expect(canEditProject({ status: true, data: null }, false, undefined)).toBe(false);
    const incomplete = response(false);
    if (incomplete.data) Reflect.deleteProperty(incomplete.data, 'isBlocked');
    expect(canEditProject(incomplete, false, undefined)).toBe(false);
  });
});
