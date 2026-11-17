import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfileImageUpload } from './ProfileImageUpload';

describe('ProfileImageUpload', () => {
  it('이미지 선택 영역과 용량 안내를 보여 준다', () => {
    render(<ProfileImageUpload onFileChange={vi.fn()} />);

    expect(screen.getByText(/이미지를 선택/i)).toBeInTheDocument();
    expect(screen.getByText(/최대 1MB/i)).toBeInTheDocument();
  });

  it('선택한 이미지 파일을 압축 핸들러에 전달한다', async () => {
    const onFileChange = vi.fn();
    const { container } = render(<ProfileImageUpload onFileChange={onFileChange} />);
    const input = screen.getByLabelText(/압축할 프로필 이미지/i);
    const image = new File(['image'], 'profile.png', { type: 'image/png' });

    expect(container.querySelector('label')).toHaveAttribute('for', 'resize');
    await userEvent.upload(input, image);
    expect(onFileChange).toHaveBeenCalledOnce();
  });
});
