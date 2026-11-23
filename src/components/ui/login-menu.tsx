'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { postData } from '@/lib/api';

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
              const response = await postData(`/user/logout`, {}, true, {
                loadingMsg: '로그아웃 중...',
                successMsg: '로그아웃 되었습니다.',
                errorMsg: '로그아웃에 실패했습니다.',
              });
              // 쿠키가 지워지지 않았는데 로그인 화면으로 보내면 로그아웃된 것으로 오해한다. 실패 안내는 요청 쪽 토스트가 맡는다
              if (response?.status === false) return;
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
