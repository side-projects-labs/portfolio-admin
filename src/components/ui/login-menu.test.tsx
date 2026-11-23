import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginWithButton } from './login-menu';

const push = vi.fn();
const refresh = vi.fn();
const postData = vi.fn();
const toast = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock('@/lib/api', () => ({ postData: (...args: unknown[]) => postData(...args) }));
vi.mock('react-hot-toast', () => ({ default: toast }));

beforeAll(() => {
  // Radix 메뉴가 jsdom에 없는 브라우저 API를 요구한다
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.HTMLElement.prototype.hasPointerCapture ??= () => false;
  window.HTMLElement.prototype.scrollIntoView ??= () => {};
});

const openMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /Toggle User/ }));
  return user;
};

describe('LoginWithButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postData.mockResolvedValue({});
  });

  it('로그인 상태에서는 로그아웃만 보여준다', async () => {
    render(<LoginWithButton />);
    await openMenu();

    expect(await screen.findByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('로그아웃 상태에서는 로그인만 보여준다', async () => {
    render(<LoginWithButton isLoggedIn={false} />);
    await openMenu();

    expect(await screen.findByRole('menuitem', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Logout' })).not.toBeInTheDocument();
  });

  it('로그아웃하면 로그아웃 요청 뒤 로그인 화면으로 이동한다', async () => {
    render(<LoginWithButton />);
    const user = await openMenu();

    await user.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    await waitFor(() => expect(postData).toHaveBeenCalledWith('/user/logout', {}, true, expect.anything()));
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('로그아웃 요청의 토스트는 컴포넌트가 정하므로 요청 쪽 토스트를 끈다', async () => {
    render(<LoginWithButton />);
    const user = await openMenu();

    await user.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    await waitFor(() => expect(postData).toHaveBeenCalledWith('/user/logout', {}, true, { disableToast: true }));
  });

  it('로그아웃에 성공하면 성공 안내를 보여주고 로그인 화면으로 이동한다', async () => {
    render(<LoginWithButton />);
    const user = await openMenu();

    await user.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(toast.success).toHaveBeenCalledWith('로그아웃 되었습니다.');
    expect(refresh).toHaveBeenCalled();
  });

  it.each([401, 403])('이미 만료·거절된 토큰이면(%i) 로그아웃된 것으로 보고 로그인 화면으로 이동한다', async status => {
    postData.mockResolvedValue({ status: false, error: { response: { status } } });
    render(<LoginWithButton />);
    const user = await openMenu();

    await user.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(refresh).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('세션이 만료되어 로그인 화면으로 이동합니다.');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ['서버 오류(500)', { response: { status: 500 } }],
    ['네트워크 오류', new Error('network')],
  ])('로그아웃 요청이 실패하면(%s) 이동하지 않고 실패를 알린다', async (_name, error) => {
    postData.mockResolvedValue({ status: false, error });
    render(<LoginWithButton />);
    const user = await openMenu();

    await user.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('로그아웃에 실패했습니다.'));
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
