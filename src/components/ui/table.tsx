'use client';
import { GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, isValidElement } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactPaginate from 'react-paginate';
import { cn } from '@/lib/utils';
import { useTableStore } from '@/lib/zustand/table';
import type { TableData, TableOptions, TableProps } from '@/types/table';

function Table({ table, isLoading = false }: TableProps) {
  const { checkbox, setTable, selectCheckbox, allSelectCheckbox } = useTableStore();
  const rowCheckboxes = table.body.flatMap(row =>
    Object.values(row).flatMap(value =>
      value && typeof value === 'object' && !isValidElement(value) && 'checkbox' in value && value.checkbox
        ? [value.checkbox]
        : [],
    ),
  );
  const allChecked =
    rowCheckboxes.length > 0 &&
    rowCheckboxes.every(item => checkbox.some(selected => selected.id === item.id && selected.checked));
  const initialTable = useRef(table);
  useEffect(() => {
    setTable(initialTable.current);
  }, [setTable]);
  useEffect(() => {
    allSelectCheckbox([]);
  }, [table.pagination?.page, allSelectCheckbox]);
  const renderValue = (value: TableData[string]) => {
    if (isValidElement(value)) return value;
    if (value === null || value === undefined) return null;
    if (typeof value !== 'object') return String(value);
    const options = value as TableOptions;
    if (options.link?.href) {
      const { href, title, ...props } = options.link;
      const className =
        'font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
      return href.startsWith('http') ? (
        <a {...props} href={href} className={className}>
          {title}
        </a>
      ) : (
        <Link {...props} href={href} className={className}>
          {title}
        </Link>
      );
    }
    if (options.checkbox) {
      const { id, value } = options.checkbox;
      return (
        <input
          type="checkbox"
          aria-label={`항목 ${value} 선택`}
          checked={checkbox.some(item => item.id === id && item.checked)}
          onChange={event => selectCheckbox({ id, value, checked: event.target.checked })}
          className="size-4 rounded border-input accent-primary"
        />
      );
    }
    if (options.status)
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium',
            options.status.status
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <span
            aria-hidden="true"
            className={cn('size-1.5 rounded-full', options.status.status ? 'bg-emerald-500' : 'bg-current')}
          />
          {options.status.title}
        </span>
      );
    return null;
  };
  const pageCount = table.pagination ? Math.ceil(table.pagination.allTotal / table.pagination.size) : 0;
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] text-muted-foreground">
          <thead className="border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground">
            <tr>
              {table.header.map(item => (
                <th key={item.id} scope="col" className="whitespace-nowrap px-4 py-3">
                  {item.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      aria-label="현재 페이지 전체 선택"
                      checked={allChecked}
                      disabled={!rowCheckboxes.length}
                      onChange={event =>
                        allSelectCheckbox(
                          event.target.checked ? rowCheckboxes.map(item => ({ ...item, checked: true })) : [],
                        )
                      }
                      className="size-4 rounded accent-primary"
                    />
                  ) : (
                    item.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <DragDropContext onDragEnd={result => table.draggableOption?.onDrop?.(result)}>
            <Droppable
              droppableId="table-body"
              direction="vertical"
              type="table-body"
              isDropDisabled={!table.draggableOption?.draggable}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {provided => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={table.header.length || 1} className="px-6 py-16 text-center">
                        <span role="status" className="inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
                          />
                          로딩 중...
                        </span>
                      </td>
                    </tr>
                  ) : table.body.length === 0 ? (
                    <tr>
                      <td colSpan={table.header.length || 1} className="px-6 py-16 text-center">
                        등록된 항목이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    table.body.map((row, index) => {
                      const checkboxOption = Object.values(row).find(
                        value => value && typeof value === 'object' && 'checkbox' in value,
                      ) as TableOptions | undefined;
                      const key = checkboxOption?.checkbox?.value ?? `row-${index}`;
                      return (
                        <Draggable
                          key={key}
                          draggableId={key}
                          index={index}
                          isDragDisabled={!table.draggableOption?.draggable}
                        >
                          {drag => (
                            <tr
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              data-row-index={index}
                              className={cn(
                                'border-b border-border bg-white transition-colors last:border-b-0 hover:bg-muted/40 dark:bg-background',
                                table.rowClassName?.(row, index),
                              )}
                            >
                              {Object.entries(row).map(([name, value], column) => (
                                <td key={name} className="px-4 py-4 align-middle">
                                  {column === 0 && table.draggableOption?.draggable ? (
                                    <div className="flex items-center gap-2">
                                      <span
                                        {...drag.dragHandleProps}
                                        aria-label={`${key} 순서 드래그`}
                                        className="cursor-grab rounded p-1 text-muted-foreground/60 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                      >
                                        <GripVertical size={14} aria-hidden="true" />
                                      </span>
                                      {renderValue(value)}
                                    </div>
                                  ) : (
                                    renderValue(value)
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
      </div>
      {table.pagination && table.pagination.allTotal > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            전체 {table.pagination.allTotal}개 · {table.pagination.page} / {pageCount} 페이지
          </span>
          {pageCount > 1 && (
            <ReactPaginate
              previousLabel="이전"
              nextLabel="다음"
              breakLabel="…"
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={({ selected }) => {
                const pagination = { ...table.pagination!, page: selected + 1 };
                setTable({ ...table, pagination });
                pagination.onPageChange?.(selected + 1);
              }}
              forcePage={table.pagination.page - 1}
              containerClassName="flex items-center gap-1"
              pageLinkClassName="flex size-8 items-center justify-center rounded-md hover:bg-muted"
              activeLinkClassName="bg-muted font-semibold text-foreground"
              previousLinkClassName="rounded-md px-2 py-2 hover:bg-muted"
              nextLinkClassName="rounded-md px-2 py-2 hover:bg-muted"
              disabledLinkClassName="pointer-events-none opacity-40"
            />
          )}
        </div>
      )}
    </div>
  );
}
export { Table };
