import { isAxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { patchData } from '@/lib/api';

const errorResponse = (error: unknown) => {
  const upstreamStatus = isAxiosError(error) ? error.response?.status : undefined;
  const status = upstreamStatus && [400, 401, 403, 404, 409].includes(upstreamStatus) ? upstreamStatus : 500;
  const message =
    status === 409
      ? '자동 동기화 프로젝트는 어드민에서 수정할 수 없습니다.'
      : '프로젝트를 수정하지 못했습니다. 잠시 후 다시 시도해주세요.';
  return NextResponse.json({ status, message }, { status });
};

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const data = await patchData(`/project/${body.slug}`, body);
    if (data.error || data.status === false) return errorResponse(data.error);
    return NextResponse.json({ ...data });
  } catch (error) {
    return errorResponse(error);
  }
}
