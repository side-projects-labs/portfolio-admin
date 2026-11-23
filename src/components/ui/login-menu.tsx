'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { postData } from '@/lib/api';
import { isRejectedTokenError } from '@/lib/auth-error';

export function LoginWithButton({ isLoggedIn = true }: { isLoggedIn?: boolean }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <User />
          <span className="sr-only">Toggle User</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isLoggedIn ? (
          <DropdownMenuItem
            onClick={async () => {
              // 결과에 따라 안내가 달라지므로 요청 쪽 토스트는 끄고 여기서 정한다
              const response = await postData(`/user/logout`, {}, true, { disableToast: true });
              if (response?.status === false) {
                // 이미 만료·거절된 토큰이면 로그아웃된 것과 같으므로 로그인 화면으로 보낸다
                if (!isRejectedTokenError(response.error)) {
                  // 쿠키가 지워지지 않았는데 로그인 화면으로 보내면 로그아웃된 것으로 오해한다
                  toast.error('로그아웃에 실패했습니다.');
                  return;
                }
                toast('세션이 만료되어 로그인 화면으로 이동합니다.');
              } else {
                toast.success('로그아웃 되었습니다.');
              }
              router.push('/login');
              router.refresh();
            }}
          >
            Logout
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => router.push('/login')}>Login</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
