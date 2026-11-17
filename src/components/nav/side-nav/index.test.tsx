import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SideNav from './index';
vi.mock('next/navigation', () => ({ usePathname: () => '/project' }));
afterEach(cleanup);
describe('모바일 탐색', () => {
  it('메뉴를 열고 Escape로 닫으면 열기 버튼으로 포커스를 돌린다', async () => {
    const user = userEvent.setup();
    render(<SideNav />);
    const trigger = screen.getByRole('button', { name: '메뉴 열기' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: '관리 메뉴' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: '관리 메뉴' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

it('모바일 메뉴를 연 뒤 데스크톱 폭으로 바꾸면 메뉴와 스크롤 잠금을 해제한다', async () => {
  render(<SideNav />);
  await userEvent.setup().click(screen.getByRole('button', { name: '메뉴 열기' }));
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.resize(window);
  await screen.findByRole('button', { name: '메뉴 열기' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).not.toBe('hidden');
});
