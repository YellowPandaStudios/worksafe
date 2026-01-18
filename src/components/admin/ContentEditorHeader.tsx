'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, FileText, Archive, Save, Clock, CalendarClock, X, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ContentStatus = 'draft' | 'published' | 'archived';

interface ContentEditorHeaderProps {
  title: string;
  status: ContentStatus;
  onStatusChange: (status: ContentStatus) => void;
  onPreview?: () => void;
  previewUrl?: string | null;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
  lastSaved?: Date | null;
  backHref: string;
  backLabel?: string;
  // Scheduling
  scheduledFor?: string | null;
  onSchedule?: (date: string | null) => void;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Utkast', icon: FileText },
  { value: 'published', label: 'Publicerad', icon: Eye },
  { value: 'archived', label: 'Arkiverad', icon: Archive },
] as const;

function getStatusChangeMessage(from: ContentStatus, to: ContentStatus): string {
  if (to === 'archived') {
    return 'Innehållet kommer att arkiveras och tas bort från den publika webbplatsen. Det kan återställas senare.';
  }
  if (from === 'published' && to === 'draft') {
    return 'Innehållet kommer att tas bort från den publika webbplatsen men behålls som utkast. Du kan publicera det igen när som helst.';
  }
  if (from === 'draft' && to === 'published') {
    return 'Innehållet kommer att publiceras och bli synligt på webbplatsen.';
  }
  if (from === 'archived' && to === 'published') {
    return 'Innehållet kommer att återställas från arkivet och publiceras direkt.';
  }
  if (from === 'archived' && to === 'draft') {
    return 'Innehållet kommer att återställas från arkivet som ett utkast.';
  }
  return 'Statusen kommer att uppdateras.';
}

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) {
    return 'just nu';
  }
  if (minutes < 60) {
    return `${minutes} min sedan`;
  }
  
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

function formatScheduledDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `idag ${time}`;
  }
  if (isTomorrow) {
    return `imorgon ${time}`;
  }

  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDefaultScheduleDateTime(): { date: string; time: string } {
  const now = new Date();
  // Default to tomorrow at 09:00
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  return {
    date: tomorrow.toISOString().split('T')[0],
    time: '09:00',
  };
}

export function ContentEditorHeader({
  title,
  status,
  onStatusChange,
  onPreview,
  previewUrl,
  onSave,
  isSaving,
  isDirty,
  lastSaved,
  backHref,
  backLabel = 'Tillbaka',
  scheduledFor,
  onSchedule,
}: ContentEditorHeaderProps): React.ReactElement {
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    newStatus: ContentStatus | '';
  }>({ open: false, newStatus: '' });

  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState('');

  const handleStatusChange = (newStatus: ContentStatus): void => {
    if (newStatus === status) return;
    setStatusChangeDialog({ open: true, newStatus });
  };

  const confirmStatusChange = (): void => {
    if (statusChangeDialog.newStatus) {
      onStatusChange(statusChangeDialog.newStatus as ContentStatus);
      // Clear schedule when changing status
      if (onSchedule && scheduledFor) {
        onSchedule(null);
      }
    }
    setStatusChangeDialog({ open: false, newStatus: '' });
  };

  const openScheduleDialog = (): void => {
    if (scheduledFor) {
      const date = new Date(scheduledFor);
      setScheduleDate(date);
      setScheduleTime(date.toTimeString().slice(0, 5));
    } else {
      const defaults = getDefaultScheduleDateTime();
      setScheduleDate(new Date(defaults.date));
      setScheduleTime(defaults.time);
    }
    setScheduleDialog(true);
  };

  const handleScheduleConfirm = (): void => {
    if (scheduleDate && scheduleTime && onSchedule) {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const dateTime = new Date(scheduleDate);
      dateTime.setHours(hours, minutes, 0, 0);
      onSchedule(dateTime.toISOString());
    }
    setScheduleDialog(false);
  };

  const handleClearSchedule = (): void => {
    if (onSchedule) {
      onSchedule(null);
    }
  };

  const currentStatusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
  const CurrentStatusIcon = currentStatusOption?.icon;
  const isScheduled = !!scheduledFor;
  const canSchedule = status === 'draft' && onSchedule;

  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b">
        {/* Left side - Back button and title */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref} aria-label={backLabel}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold truncate max-w-md">
              {title || 'Ny post'}
            </h1>
            {/* Scheduled indicator */}
            {isScheduled && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                <CalendarClock className="h-3 w-3" />
                <span>Schemalagd: {formatScheduledDate(scheduledFor!)}</span>
                <button
                  type="button"
                  onClick={handleClearSchedule}
                  className="ml-1 hover:text-destructive"
                  title="Ta bort schemaläggning"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Last saved indicator */}
          {lastSaved && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Sparad {formatLastSaved(lastSaved)}</span>
            </div>
          )}

          {/* Preview button */}
          {(onPreview || previewUrl) && (
            <Button
              type="button"
              variant="outline"
              onClick={onPreview || (() => previewUrl && window.open(previewUrl, '_blank'))}
              disabled={!previewUrl}
            >
              <Eye className="h-4 w-4 mr-2" />
              Förhandsvisa
            </Button>
          )}

          {/* Schedule button */}
          {canSchedule && (
            <Button
              type="button"
              variant="outline"
              onClick={openScheduleDialog}
              className={isScheduled ? 'border-amber-500 text-amber-600 dark:text-amber-500' : ''}
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              {isScheduled ? 'Ändra' : 'Schemalägg'}
            </Button>
          )}

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-auto h-10 font-medium">
                <SelectValue>
                  {currentStatusOption && CurrentStatusIcon && (
                    <div className="flex items-center gap-2">
                      <CurrentStatusIcon className="h-4 w-4" />
                      <span>{currentStatusOption.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((option) => {
                  // Only show archive option if currently published
                  if (option.value === 'archived' && status !== 'published') {
                    return false;
                  }
                  return true;
                }).map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Save button */}
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving || !isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sparar...' : 'Spara'}
          </Button>
        </div>
      </div>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        open={statusChangeDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setStatusChangeDialog({ open: false, newStatus: '' });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusChangeDialog.newStatus === 'archived'
                ? 'Arkivera innehåll?'
                : 'Ändra status?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getStatusChangeMessage(status, statusChangeDialog.newStatus as ContentStatus)}
              {statusChangeDialog.newStatus === 'archived' && (
                <span className="block mt-2 font-semibold text-destructive">
                  Detta är en destruktiv åtgärd.
                </span>
              )}
              {isScheduled && statusChangeDialog.newStatus === 'published' && (
                <span className="block mt-2 text-amber-600">
                  Schemaläggningen kommer att tas bort.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={
                statusChangeDialog.newStatus === 'archived'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Bekräfta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent className="sm:max-w-fit">
          <DialogHeader>
            <DialogTitle>Schemalägg publicering</DialogTitle>
            <DialogDescription>
              Välj datum och tid för när innehållet ska publiceras automatiskt.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-6 py-4">
            {/* Calendar */}
            <div className="border rounded-lg p-1">
              <Calendar
                mode="single"
                selected={scheduleDate}
                onSelect={setScheduleDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md"
              />
            </div>
            
            {/* Time picker */}
            <div className="flex flex-col gap-4 sm:min-w-[160px]">
              <div className="grid gap-2">
                <Label htmlFor="schedule-time">Tid</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Quick time options */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Snabbval</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={scheduleTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScheduleTime(time)}
                      className="text-xs h-8"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {scheduleDate && scheduleTime && (
                <div className="mt-auto p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Publiceras</p>
                  <p className="text-sm font-semibold text-primary">
                    {(() => {
                      const [hours, minutes] = scheduleTime.split(':').map(Number);
                      const dateTime = new Date(scheduleDate);
                      dateTime.setHours(hours, minutes, 0, 0);
                      return formatScheduledDate(dateTime.toISOString());
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {isScheduled && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleClearSchedule();
                  setScheduleDialog(false);
                }}
                className="text-destructive hover:text-destructive"
              >
                Ta bort
              </Button>
            )}
            <Button
              type="button"
              onClick={handleScheduleConfirm}
              disabled={!scheduleDate || !scheduleTime}
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              Schemalägg
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
