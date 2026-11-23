/**
 * 인증 서버가 토큰을 거절한 오류인지 판단한다. 401·403만 해당하며, 서버 오류·네트워크 오류처럼
 * 응답 상태를 알 수 없는 경우는 거절이 아니라 장애로 본다.
 */
export function isRejectedTokenError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } } | null | undefined)?.response?.status;
  return status === 401 || status === 403;
}
