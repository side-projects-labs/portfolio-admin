import { FolderOpenDot, User, Layers, type LucideIcon } from 'lucide-react';
export type SiteConfig = typeof siteConfig;
export type Navigation = { icon: LucideIcon; name: string; href: string };
export const siteConfig = {
  title: 'Portfolio — 콘텐츠 관리',
  description: '프로젝트·프로필·기술 스택을 관리하는 포트폴리오 워크스페이스입니다.',
};
export const navigations: Navigation[] = [
  { icon: FolderOpenDot, name: '프로젝트', href: '/project' },
  { icon: User, name: '프로필', href: '/profile' },
  { icon: Layers, name: '기술 스택', href: '/stacks' },
];
