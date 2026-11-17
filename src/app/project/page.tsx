'use client';
import { StackIcon } from '@yeoncheols/portfolio-core-ui';
import dayjs from 'dayjs';
import { ArrowDown, ArrowUp, Download, FolderOpen, LockKeyhole, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { type AdminProjectResponse, type AdminTagResponse } from '@/docs/api';
import { deleteData, patchData } from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { loadProjectList, PROJECT_LIST_KEY } from '@/lib/project-list';
import { cn } from '@/lib/utils';
import { useTableStore } from '@/lib/zustand/table';
import { type TableHeader } from '@/types/table';

const headers: TableHeader[] = [
  { id: 1, type: 'checkbox' },
  { id: 2, name: '순서' },
  { id: 3, name: '프로젝트' },
  { id: 4, name: '기술 스택' },
  { id: 5, name: '게시 상태' },
  { id: 6, name: '최근 수정' },
  { id: 7, name: '관리' },
];
type Visibility = 'all' | 'published' | 'hidden';
export default function Project() {
  const router = useRouter();
  const { checkbox } = useTableStore();
  const { data, isLoading, error, mutate } = useSWR(PROJECT_LIST_KEY, loadProjectList);
  const { data: stacksData } = useSWR<{ data: AdminTagResponse[] }>('/api/stacks', fetcher);
  const [keyword, setKeyword] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('all');
  const [source, setSource] = useState('all');
  const [sort, setSort] = useState('order');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const projects = useMemo(() => data?.data.data ?? [], [data]);
  const ordered = useMemo(() => [...projects].sort((a, b) => b.order - a.order), [projects]);
  const filtered = useMemo(() => {
    const search = keyword.trim().toLocaleLowerCase();
    return ordered
      .filter(
        item =>
          (!search || `${item.title} ${item.slug} ${item.description}`.toLocaleLowerCase().includes(search)) &&
          (visibility === 'all' || item.isShow === (visibility === 'published')) &&
          (source === 'all' || item.source === source),
      )
      .sort((a, b) =>
        sort === 'updated' ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() : b.order - a.order,
      );
  }, [ordered, keyword, visibility, source, sort]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const pageProjects = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const hasFilter = Boolean(keyword || source !== 'all' || visibility !== 'all');
  const canReorder = !hasFilter && sort === 'order' && !busy;
  const runAction = async (request: () => Promise<{ status: boolean | number }>) => {
    setBusy(true);
    try {
      const result = await request();
      if (result.status !== true && result.status !== 200) throw new Error('변경 요청이 거부되었습니다.');
      await mutate();
    } catch {
      toast.error('변경하지 못했습니다. 목록을 새로고침한 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  };
  const swap = async (first: AdminProjectResponse, second?: AdminProjectResponse) => {
    if (!second || !canReorder) return;
    await runAction(() =>
      patchData('/api/project/order', {
        nextSlug: first.slug,
        nextOrderNo: second.order,
        prevSlug: second.slug,
        prevOrderNo: first.order,
      }),
    );
  };
  const download = () => {
    const selected = checkbox.filter(item => item.checked);
    if (selected.length !== 1) {
      toast.error('이미지를 다운로드할 프로젝트를 하나 선택해주세요.');
      return;
    }
    const image = projects.find(item => item.slug === selected[0].value)?.image;
    if (!image) {
      toast.error('등록된 대표 이미지가 없습니다.');
      return;
    }
    const link = document.createElement('a');
    link.href = image + '?download';
    link.click();
  };
  const rows = pageProjects.map(item => {
    const editable = item.isBlocked === false;
    const orderIndex = ordered.findIndex(project => project.slug === item.slug);
    const names: string[] = JSON.parse(item.stacks);
    return {
      selection: { checkbox: { id: `checkbox-${item.id}`, value: item.slug, checked: false } },
      order: (
        <div className="flex items-center gap-2 text-xs tabular-nums">
          <span className="w-4">{item.order}</span>
          <div className="flex flex-col">
            <button
              type="button"
              aria-label={`${item.title} 순서 위로`}
              disabled={!canReorder || orderIndex === 0}
              onClick={() => swap(item, ordered[orderIndex - 1])}
              className="rounded p-1 hover:bg-muted disabled:opacity-20"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              aria-label={`${item.title} 순서 아래로`}
              disabled={!canReorder || orderIndex === ordered.length - 1}
              onClick={() => swap(item, ordered[orderIndex + 1])}
              className="rounded p-1 hover:bg-muted disabled:opacity-20"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
      ),
      project: (
        <div className="min-w-48 max-w-sm space-y-1.5">
          <button
            type="button"
            onClick={() => router.push(`/project/preview/${item.slug}`)}
            className="text-left font-medium text-foreground hover:underline"
          >
            {item.title}
          </button>
          <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-mono text-muted-foreground">{item.slug}</span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded border px-1.5 py-0.5',
                item.isBlocked === true
                  ? 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  : 'border-border text-muted-foreground',
              )}
            >
              {item.isBlocked === true && <LockKeyhole size={10} aria-hidden="true" />}
              {item.isBlocked === true ? '자동 동기화 · 읽기 전용' : editable ? '직접 관리' : '편집 상태 확인 중'}
            </span>
          </div>
        </div>
      ),
      stacks: (
        <div className="flex max-w-52 flex-wrap gap-1">
          {names.slice(0, 3).map(name => {
            const metadata = stacksData?.data?.find(stack => stack.name === name);
            return (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-1 text-[11px] whitespace-nowrap"
              >
                {metadata && <StackIcon name={name} icon={metadata.icon} color={metadata.color} size={12} />}
                {name}
              </span>
            );
          })}
          {names.length > 3 && (
            <span className="self-center text-[11px]" title={names.slice(3).join(', ')}>
              +{names.length - 3}
            </span>
          )}
        </div>
      ),
      isShow: { status: { status: item.isShow, title: item.isShow ? '게시' : '숨김' } },
      updatedAt: (
        <time dateTime={item.updatedAt} className="whitespace-nowrap text-xs tabular-nums">
          {dayjs(item.updatedAt).format('YYYY.MM.DD')}
        </time>
      ),
      actions: (
        <div className="flex min-w-44 flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => runAction(() => patchData('/api/project/show', { slug: item.slug, isShow: !item.isShow }))}
          >
            {item.isShow ? '숨김' : '게시'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!editable || busy}
            title={!editable ? '콘텐츠는 연결된 저장소에서 수정해주세요.' : undefined}
            onClick={() => router.push(`/project/edit?slug=${item.slug}`)}
          >
            수정
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              if (window.confirm(`"${item.title}" 프로젝트를 삭제하시겠습니까?`))
                void runAction(() => deleteData(`/api/project/delete?slug=${item.slug}`));
            }}
          >
            삭제
          </Button>
          <a
            href={editable ? `/project/write/${item.slug}` : `/project/preview/${item.slug}`}
            className={cn(
              'px-2 py-1 text-xs underline-offset-4 hover:underline',
              !editable && !item.content && 'pointer-events-none opacity-50',
            )}
          >
            {editable ? '본문 편집' : '본문 보기'}
          </a>
        </div>
      ),
    };
  });
  const reset = () => {
    setKeyword('');
    setVisibility('all');
    setSource('all');
    setSort('order');
    setPage(1);
  };
  if (error)
    return (
      <section role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="font-medium">프로젝트를 불러오지 못했습니다.</h2>
        <p className="mt-2 text-sm text-muted-foreground">연결 상태를 확인한 후 다시 시도해주세요.</p>
        <Button variant="outline" className="mt-4" onClick={() => mutate()}>
          다시 시도
        </Button>
      </section>
    );
  return (
    <section aria-label="프로젝트 관리" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">모든 프로젝트</h2>
          <p className="mt-1 text-sm text-muted-foreground">프로젝트 소개와 포트폴리오 노출 상태를 관리합니다.</p>
        </div>
        <Button onClick={() => router.push('/project/create')}>
          <Plus size={16} aria-hidden="true" />새 프로젝트
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1 border-b border-border" aria-label="게시 상태 필터">
        {(
          [
            ['all', '전체', projects.length],
            ['published', '게시', projects.filter(item => item.isShow).length],
            ['hidden', '숨김', projects.filter(item => !item.isShow).length],
          ] as const
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            aria-pressed={visibility === value}
            aria-label={`${label} ${isLoading ? '불러오는 중' : count}`}
            onClick={() => {
              setVisibility(value);
              setPage(1);
            }}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors',
              visibility === value
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">{isLoading ? '—' : count}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col justify-between gap-3 desktop:flex-row">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="relative w-full tablet:w-72">
            <Search size={16} aria-hidden="true" className="absolute left-3 top-3 text-muted-foreground" />
            <input
              type="search"
              aria-label="프로젝트 검색"
              placeholder="제목, slug, 설명으로 검색"
              value={keyword}
              onChange={event => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            aria-label="프로젝트 출처"
            value={source}
            onChange={event => {
              setSource(event.target.value);
              setPage(1);
            }}
            className="admin-select"
          >
            <option value="all">모든 출처</option>
            <option value="personal">개인</option>
            <option value="company">회사</option>
          </select>
          <select
            aria-label="프로젝트 정렬"
            value={sort}
            onChange={event => {
              setSort(event.target.value);
              setPage(1);
            }}
            className="admin-select"
          >
            <option value="order">노출 순서</option>
            <option value="updated">최근 수정순</option>
          </select>
          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={reset}>
              필터 초기화
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={download} className="self-start">
          <Download size={14} aria-hidden="true" />
          이미지 다운로드
        </Button>
      </div>
      {(hasFilter || sort !== 'order') && (
        <p className="text-xs text-muted-foreground">
          {filtered.length}개 검색 결과 · 순서를 바꾸려면 필터를 해제하고 노출 순서로 정렬해주세요.
        </p>
      )}
      {!isLoading && filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <FolderOpen size={28} className="mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">
            {hasFilter ? '조건에 맞는 프로젝트가 없습니다.' : '등록된 프로젝트가 없습니다.'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasFilter ? '검색어나 필터를 변경해보세요.' : '새 프로젝트를 등록해 포트폴리오를 채워보세요.'}
          </p>
        </div>
      ) : (
        <Table
          isLoading={isLoading}
          table={{
            header: headers,
            body: rows,
            rowClassName: (_row, index) =>
              pageProjects[index]?.isBlocked === true
                ? 'bg-slate-100 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900 border-l-4 border-l-slate-400 dark:border-l-slate-500'
                : undefined,
            pagination: {
              page: currentPage,
              size: 10,
              total: rows.length,
              allTotal: filtered.length,
              onPageChange: setPage,
            },
            draggableOption: {
              draggable: canReorder,
              onDrop: result => {
                if (result.destination)
                  void swap(pageProjects[result.source.index], pageProjects[result.destination.index]);
              },
            },
          }}
        />
      )}
      <p className="text-xs text-muted-foreground">
        자동 동기화 프로젝트의 콘텐츠는 저장소에서 수정합니다. 게시·숨김과 순서 변경, 삭제는 이곳에서 관리할 수
        있습니다.
      </p>
    </section>
  );
}
