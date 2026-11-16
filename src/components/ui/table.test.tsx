import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Table } from './table';
import type { ReactNode } from 'react';
const mocks = vi.hoisted(() => ({
  store: {
    table: {
      header: [
        { id: 1, name: '프로젝트' },
        { id: 2, name: '관리' },
      ],
      body: [],
    },
    checkbox: [],
    setTable: vi.fn(),
    selectCheckbox: vi.fn(),
    allSelectCheckbox: vi.fn(),
  },
}));
vi.mock('@/lib/zustand/table', () => ({ useTableStore: () => mocks.store }));
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: ReactNode }) => children,
  Droppable: ({ children }: { children: (provided: Record<string, unknown>) => ReactNode }) =>
    children({ innerRef: vi.fn(), placeholder: null }),
  Draggable: ({ children }: { children: (provided: Record<string, unknown>) => ReactNode }) =>
    children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }),
}));
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    tbody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  },
}));
afterEach(cleanup);
describe('테이블 행 표시', () => {
  it('행별 표시를 적용해도 셀 구조와 관리 버튼은 유지한다', () => {
    const table = {
      header: mocks.store.table.header,
      body: [
        { title: '개인', action: <button>숨김</button> },
        { title: '회사', action: <button>숨김</button> },
      ],
      rowClassName: (_row: unknown, index: number) =>
        index === 0 ? 'bg-slate-100 border-l-4 border-l-slate-400' : undefined,
    };
    render(<Table table={table} />);
    const personal = screen.getByRole('row', { name: '개인 숨김' });
    const company = screen.getByRole('row', { name: '회사 숨김' });
    expect(personal).toHaveClass('bg-slate-100', 'border-l-4');
    expect(company).not.toHaveClass('bg-slate-100');
    expect(within(personal).getAllByRole('cell')).toHaveLength(2);
    expect(within(personal).getByRole('button', { name: '숨김' })).toBeEnabled();
  });
  it('행 표시 옵션이 없는 기존 테이블은 기본 스타일을 유지한다', () => {
    render(
      <Table
        table={{ header: mocks.store.table.header, body: [{ title: '기존 항목', action: <button>수정</button> }] }}
      />,
    );
    expect(screen.getByRole('row', { name: '기존 항목 수정' })).toHaveClass('bg-white');
    expect(screen.getByRole('button', { name: '수정' })).toBeEnabled();
  });
});
