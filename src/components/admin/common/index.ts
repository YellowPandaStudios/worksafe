/**
 * Admin Common Components
 *
 * Reusable components for the admin panel.
 * Import from '@/components/admin/common' for cleaner imports.
 */

// Page Layout
export { PageHeader, type PageHeaderProps } from './PageHeader';
export { PageContainer, type PageContainerProps } from './PageContainer';

// Data Display
export {
  DataTableAdvanced,
  type DataTableAdvancedProps,
  type ColumnDef,
  type RowAction,
  type SortDirection,
} from './DataTableAdvanced';
export {
  DataCard,
  DataCardGrid,
  DataCardGridSkeleton,
  type DataCardProps,
  type DataCardAction,
  type DataCardGridProps,
} from './DataCard';
export {
  StatCard,
  StatCardGrid,
  type StatCardProps,
  type StatCardGridProps,
} from './StatCard';

// Form Components
export {
  FormSection,
  FormSectionSeparator,
  FormActions,
  type FormSectionProps,
  type FormActionsProps,
} from './FormSection';
export {
  FormTabs,
  FormTabContent,
  type FormTabsProps,
  type TabConfig,
  type FormTabContentProps,
} from './FormTabs';
export {
  RepeatableFieldList,
  RepeatableItemCard,
  type RepeatableFieldListProps,
  type ItemHandlers,
  type RepeatableItemCardProps,
} from './RepeatableFieldList';
export {
  SearchableSelect,
  type SearchableSelectProps,
  type SelectOption,
} from './SearchableSelect';
export {
  CharacterCountInput,
  CharacterCountTextarea,
  MetaTitleInput,
  MetaDescriptionTextarea,
  type CharacterCountInputProps,
  type CharacterCountTextareaProps,
  type SEOInputProps,
} from './CharacterCountInput';
export {
  SlugInput,
  SlugPreview,
  type SlugInputProps,
  type SlugPreviewProps,
} from './SlugInput';

// Dialogs & Sheets
export {
  ConfirmDialog,
  useConfirmDialog,
  type ConfirmDialogProps,
  type ConfirmDialogVariant,
  type UseConfirmDialogOptions,
  type UseConfirmDialogReturn,
} from './ConfirmDialog';
export {
  FormDialog,
  useFormDialog,
  type FormDialogProps,
  type UseFormDialogOptions,
  type UseFormDialogReturn,
} from './FormDialog';
export {
  DetailSheet,
  DetailItem,
  DetailGrid,
  DetailSection,
  type DetailSheetProps,
  type DetailItemProps,
  type DetailGridProps,
  type DetailSectionProps,
} from './DetailSheet';

// Status & Feedback
export {
  StatusBadge,
  STATUS_LABELS,
  getStatusLabel,
  renderStatusBadge,
  type StatusBadgeProps,
  type StatusBadgeVariant,
} from './StatusBadge';
export {
  EmptyState,
  SearchEmptyState,
  type EmptyStateProps,
} from './EmptyState';
export {
  LoadingState,
  CardSkeleton,
  TableRowSkeleton,
  FormSkeleton,
  PageLoadingState,
  type LoadingStateProps,
} from './LoadingState';

// Table Components
export {
  TableToolbar,
  ActiveFilters,
  type TableToolbarProps,
  type FilterConfig,
  type FilterOption,
  type ActiveFiltersProps,
} from './TableToolbar';
export {
  TablePagination,
  usePagination,
  type TablePaginationProps,
  type UsePaginationOptions,
  type UsePaginationReturn,
} from './TablePagination';
export {
  BulkActionsBar,
  createCommonBulkActions,
  type BulkActionsBarProps,
  type BulkAction,
} from './BulkActions';
