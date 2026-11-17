'use client';
import dayjs from 'dayjs';
import { isArray, isEqual } from 'lodash-es';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Table } from '@/components/ui/table';
import { profileTableHeader } from '@/data/table/profile';
import { type AdminProfileResponse } from '@/docs/api';
import { deleteData, patchData } from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { downloadFile } from '@/lib/file/downloadFile';
import { resizeFile } from '@/lib/file/resizeFile';
import { useTableStore } from '@/lib/zustand/table';
import { ProfileImageUpload } from './ProfileImageUpload';

export default function Profile() {
  const router = useRouter();

  const { table, checkbox, setBody } = useTableStore();
  const { data, isLoading, error, mutate } = useSWR<{ status?: boolean; data: AdminProfileResponse[] }>(
    `/api/profile?page=1&size=5`,
    fetcher,
  );

  const handleChangeStatus = useCallback(
    async (request: AdminProfileResponse) => {
      const { id, isActive } = request;
      await patchData('/api/profile/show', { id, isActive: !isActive });
      await mutate();
    },
    [mutate],
  );

  const handleDelete = useCallback(
    async (slug: AdminProfileResponse['id']) => {
      await deleteData(`/api/profile/delete?slug=${slug}`);
      await mutate();
    },
    [mutate],
  );

  const handleDownImg = async () => {
    if (!data?.data) {
      return;
    }
    if (checkbox.length === 0) {
      toast.error('다운로드할 프로젝트를 선택해주세요.');
      return;
    }
    if (checkbox.length > 1) {
      toast.error(
        <>
          이미지 다운로드는 <br />
          하나의 프로필만 가능합니다.
        </>,
        { position: 'bottom-left' },
      );
      return;
    }

    const { imageUrl } =
      data?.data?.filter(item => String(item.id) === checkbox.find(checkbox => checkbox.checked)?.value)[0] || {};
    if (!imageUrl) {
      toast.error('이미지 url을 찾을 수 없습니다.', { position: 'bottom-left' });
      return;
    }

    downloadFile({ type: 'url', url: imageUrl });
  };

  const handleResizeFile = async (e: React.FormEvent<HTMLInputElement>) => {
    toast('이미지 압축 진행 중...');

    try {
      await resizeFile(e.currentTarget?.files?.[0] as File);
      toast.success('이미지 압축 성공');
    } catch {
      toast.error('이미지 압축 중 오류가 발생했습니다.');
    }
  };

  const profileTableData = useMemo(() => {
    if (!data?.data || !isArray(data.data)) {
      return [];
    }
    return data.data.map(item => ({
      id: {
        checkbox: {
          id: `checkbox-${item.id}`,
          value: String(item.id),
          checked: false,
        },
      },
      img: (
        <div className="flex items-center text-gray-900 whitespace-nowrap dark:text-white">
          {item.imageUrl && (
            <NextImage
              src={item.imageUrl}
              alt={item.name}
              className="mr-2 rounded-full"
              width={40}
              height={40}
              unoptimized
            />
          )}
          <div className="ps-3">
            <a
              href={item.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tet-blue-600 hover:underline hover:font-semibold transition-colors duration-200"
            >
              <span className="text-base font-semibold">{item.name}</span>
            </a>
          </div>
        </div>
      ),
      isShow: {
        status: {
          status: item.isActive,
          title: item.isActive ? '사용' : '미사용',
        },
      },
      updatedAt: dayjs(item.updatedAt).format('YYYY.MM.DD'),
      buttonGroup: (
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" className="text-foreground" size="sm" onClick={() => handleChangeStatus(item)}>
            변경
          </Button>

          <Button
            variant="ghost"
            className="text-foreground"
            size="sm"
            onClick={() => router.push(`/profile/edit?id=${item.id}`)}
          >
            수정
          </Button>

          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            size="sm"
            onClick={() => handleDelete(item.id)}
          >
            삭제
          </Button>
        </div>
      ),
    }));
  }, [data, handleChangeStatus, handleDelete, router]);

  useEffect(() => {
    if (!isEqual(profileTableData, table.body)) {
      setBody(profileTableData);
    }
  }, [profileTableData, setBody, table.body]);

  if (error || data?.status === false)
    return (
      <section role="alert" className="rounded-lg border border-destructive/20 p-6">
        <p>프로필을 불러오지 못했습니다.</p>
        <Button className="mt-4" variant="outline" onClick={() => mutate()}>
          다시 시도
        </Button>
      </section>
    );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-base font-semibold">프로필 이미지</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          포트폴리오에 사용할 이미지를 등록하고 활성 상태를 관리합니다.
        </p>
      </div>
      <ProfileImageUpload onFileChange={handleResizeFile} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button onClick={() => router.push('/profile/create')}>프로필 생성</Button>
        <Button variant="outline" onClick={handleDownImg}>
          프로필 다운로드
        </Button>
      </div>

      {profileTableData.length === 0 && (
        <p className="my-6 rounded-lg border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          등록된 프로필이 없습니다.
        </p>
      )}
      {profileTableData.length > 0 && (
        <Table
          table={{
            header: profileTableHeader,
            body: profileTableData,
          }}
        />
      )}
    </>
  );
}
