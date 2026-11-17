import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './modal';
afterEach(() => {
  cleanup();
  document.getElementById('modal')?.remove();
});
describe('관리 폼 모달', () => {
  it('열릴 때 입력으로 포커스를 옮기고 Escape로 닫으면 원래 버튼으로 돌아간다', async () => {
    const portal = document.createElement('div');
    portal.id = 'modal';
    document.body.append(portal);
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const close = vi.fn();
    const user = userEvent.setup();
    const view = render(
      <Modal isOpen headerTitle="새 기술 스택" onClose={close}>
        <input aria-label="스택명" />
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: '새 기술 스택' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '스택명' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(close).toHaveBeenCalled();
    view.rerender(
      <Modal isOpen={false} onClose={close}>
        <input />
      </Modal>,
    );
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
