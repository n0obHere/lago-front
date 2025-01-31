import { useVirtualizer } from '@tanstack/react-virtual'
import { ReactNode, useEffect, useMemo, useRef } from 'react'

import { tw } from '~/styles/utils'

import { Typography } from '../Typography'

const DEFAULT_COLUMN_WIDTH = 160
const DEFAULT_LEFT_COLUMN_WIDTH = 120

type DataItem = {
  id: string
}

type RowType = 'header' | 'data'
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`
type DotNestedKeys<T> = (
  T extends object
    ? { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<
        keyof T,
        symbol
      >]
    : ''
) extends infer D
  ? Extract<D, string>
  : never

type TColumns<T> = {
  content: (item: T) => ReactNode
  key: DotNestedKeys<T>
  label: string | ReactNode
  type: RowType
}[]

type HorizontalDataTableProps<T> = {
  columns: TColumns<T>
  data: T[]
  columnWidth?: number
  leftColumnWidth?: number
  columnIdPrefix?: string
}

const getRowHeight = (rowType: RowType) => {
  if (rowType === 'header') return 40

  return 48
}

export const HorizontalDataTable = <T extends DataItem>({
  data = [],
  columns = [],
  leftColumnWidth = DEFAULT_LEFT_COLUMN_WIDTH,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  columnIdPrefix = 'column-',
}: HorizontalDataTableProps<T>) => {
  const parentRef = useRef(null)

  const columnVirtualizer = useVirtualizer({
    count: data.length,
    horizontal: true,
    paddingStart: leftColumnWidth,
    estimateSize: () => columnWidth,
    getScrollElement: () => parentRef.current,
  })

  useEffect(() => {
    // On init, scroll to the last element
    columnVirtualizer.scrollToIndex(data.length - 1)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tableHeight = useMemo(
    () => columns.reduce((acc, item) => acc + getRowHeight(item.type), 0),
    [columns],
  )

  return (
    <div className="relative w-full">
      {!!columns.length && (
        <div
          className={tw('pointer-events-none absolute left-0 top-0 z-10 bg-white', {
            'shadow-r': !!columnVirtualizer?.scrollOffset,
          })}
          style={{ width: leftColumnWidth }}
        >
          {columns.map((item, index) => (
            <div
              key={`left-column-item-${index}`}
              className={tw('flex items-center shadow-b', {
                'shadow-y': index === 0,
              })}
              style={{ height: getRowHeight(item.type) }}
            >
              {typeof item.label === 'string' ? (
                <Typography
                  variant={item.type === 'header' ? 'captionHl' : 'bodyHl'}
                  color={item.type === 'header' ? 'grey600' : 'grey700'}
                >
                  {item.label}
                </Typography>
              ) : (
                <>{item.label}</>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        ref={parentRef}
        className="w-full overflow-x-auto no-scrollbar"
        style={{
          height: tableHeight,
        }}
      >
        <div
          className="relative h-full"
          style={{
            width: `${columnVirtualizer.getTotalSize()}px`,
          }}
        >
          {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
            <div
              id={`${columnIdPrefix}${virtualColumn.index}`}
              key={`column-${virtualColumn.index}`}
              className="absolute left-0 top-0 bg-white hover:bg-grey-100"
              style={{
                width: `${virtualColumn.size}px`,
                transform: `translateX(${virtualColumn.start}px)`,
              }}
            >
              {columns.map((column, index) => (
                <div
                  key={`column-${virtualColumn.index}-item-${index}-data-${column.key}`}
                  className={tw('flex items-center justify-end px-1 shadow-b', {
                    'shadow-y': index === 0,
                  })}
                  style={{ height: getRowHeight(column.type) }}
                >
                  {column.content(data[virtualColumn.index])}
                </div>
              ))}
            </div>
            // {virtualColumn.index}
          ))}
        </div>
      </div>
    </div>
  )
}
