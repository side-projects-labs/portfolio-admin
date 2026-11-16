'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { TopNav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Editor } from '@/components/ui/editor';
import { ProjectEditGuard } from '@/components/ui/project/edit-guard';
import { patchData } from '@/lib/api';
import { usePropsContext } from '@/lib/context/props';
import { fetcher } from '@/lib/fetcher';
import { canEditProject } from '@/lib/project-edit-policy';
import { useSpellCheckStore } from '@/lib/zustand/spellCheck';
import type { ProjectDetailResponse } from '@/types/project';

export default function ProjectEditContent() {
  const { setContent: setSpellCheckContent } = useSpellCheckStore();

  const { setContextProps } = usePropsContext();
  const { theme } = useTheme();

  const router = useRouter();
  const params = useParams();

  const { data, error, isLoading, mutate } = useSWR<ProjectDetailResponse>(
    `/api/project/slug?slug=${params.slug}`,
    fetcher,
  );

  const canEdit = canEditProject(data, isLoading, error);

  const [content, setContent] = useState('');

  const handleChangeContent = (markdown: string) => {
    setContent(markdown);
  };
  const handleContentSave = async () => {
    if (!canEdit) return;
    const response = await patchData(`/api/project/edit`, {
      content,
      slug: params.slug,
    });
    if (response.status !== 200) {
      toast.error('프로젝트를 수정하지 못했습니다. 편집 상태를 다시 확인해주세요.');
      await mutate();
      return;
    }
    router.push('/project');
  };

  const handleSpellCheck = () => {
    setSpellCheckContent(content);
    router.push('/spell-checker');
  };

  useEffect(() => {
    if (data?.data?.content) {
      setContent(data?.data?.content);
    }
  }, [data]);

  useEffect(() => {
    setContextProps({ noneLayout: true, header: <TopNav title="프로젝트 내용 수정" /> });
  }, [setContextProps]);

  return (
    <ProjectEditGuard response={data} isLoading={isLoading} error={error}>
      <div data-color-mode={theme}>
        <Editor markdown={content} onEditorChange={handleChangeContent} height={700} />
      </div>
      <div className="flex justify-start mt-8">
        <Button variant="secondary" size="lg" onClick={handleContentSave}>
          출간하기
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSpellCheck}
        >
          맞춤법 검사
        </Button>
      </div>
    </ProjectEditGuard>
  );
}
