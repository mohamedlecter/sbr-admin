
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}
export function DataTable<T extends { id?: string }>({
  columns,
  data,
  pagination,
  onPageChange,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full space-y-4">
      {/* Desktop/Tablet Table View */}
      <div className="hidden sm:block rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-left text-xs sm:text-sm font-semibold text-gray-600 px-3 py-3 lg:px-6 lg:py-4 whitespace-nowrap ${
                      column.hideOnTablet ? "hidden lg:table-cell" : ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                safeData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={`transition-colors hover:bg-gray-50 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-3 lg:px-6 lg:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap ${
                          column.hideOnTablet ? "hidden lg:table-cell" : ""
                        }`}
                      >
                        {column.render
                          ? column.render((item as any)[column.key], item)
                          : (item as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {safeData.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            {emptyMessage}
          </div>
        ) : (
          safeData.map((item, index) => (
            <div
              key={item.id || index}
              className={`rounded-lg border border-gray-200 bg-white p-4 space-y-3 shadow-sm transition-all duration-200 ${
                onRowClick
                  ? "cursor-pointer hover:shadow-md hover:border-gray-300 active:scale-[0.98]"
                  : ""
              }`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (
                  target.closest("button") ||
                  target.closest("a") ||
                  target.closest('[role="button"]')
                ) {
                  return;
                }
                onRowClick?.(item);
              }}
            >
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => {
                  const value = column.render
                    ? column.render((item as any)[column.key], item)
                    : (item as any)[column.key];

                  if ((!value || value === "-") && column.key === "actions")
                    return null;

                  const displayValue = value || "-";

                  return (
                    <div key={column.key} className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {column.label}
                      </span>
                      <div className="text-sm text-gray-900 break-words">
                        {displayValue}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Page {pagination.page} of {pagination.pages}
            <span className="hidden xs:inline ml-1">
              ({pagination.total} total items)
            </span>
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPageChange?.(pagination.page - 1);
              }}
              disabled={pagination.page === 1}
              className="inline-flex items-center justify-center h-9 px-3 sm:px-4 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Previous</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPageChange?.(pagination.page + 1);
              }}
              disabled={pagination.page === pagination.pages}
              className="inline-flex items-center justify-center h-9 px-3 sm:px-4 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              <span className="mr-1 hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}