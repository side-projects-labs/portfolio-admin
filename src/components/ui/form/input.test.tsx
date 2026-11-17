import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormInput } from './input';
afterEach(cleanup);
describe('입력 오류 안내', () => {
  it('오류 메시지를 입력 필드와 연결한다', () => {
    render(
      <FormInput
        id="title"
        name="프로젝트명"
        errors={{ title: { type: 'required', message: '제목을 입력해주세요.' } }}
      />,
    );
    const input = screen.getByRole('textbox', { name: '프로젝트명' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('제목을 입력해주세요.');
  });
});
