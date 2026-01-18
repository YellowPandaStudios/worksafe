'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash2, Copy, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/admin/common';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import { FORM_PRESET_LABELS } from '@/lib/form-presets';
import type { FormPreset } from '@/types/blocks';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preset: string;
  usageCount: number;
  isActive: boolean;
  updatedAt: Date;
}

interface FormTemplatesListProps {
  templates: Template[];
}

export function FormTemplatesList({ templates }: FormTemplatesListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/form-templates/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kunde inte ta bort mallen');
      }

      toast.success('Mall borttagen');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Kunde inte ta bort mallen');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      // Fetch the full template
      const response = await fetch(`/api/admin/form-templates/${template.id}`);
      if (!response.ok) throw new Error('Kunde inte hämta mallen');
      
      const fullTemplate = await response.json();

      // Create a copy
      const copyResponse = await fetch('/api/admin/form-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fullTemplate,
          name: `${template.name} (kopia)`,
          slug: `${template.slug}-kopia-${Date.now()}`,
        }),
      });

      if (!copyResponse.ok) {
        throw new Error('Kunde inte duplicera mallen');
      }

      toast.success('Mall duplicerad');
      router.refresh();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      toast.error('Kunde inte duplicera mallen');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Användningar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uppdaterad</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <Link
                    href={`/admin/contact/${template.id}`}
                    className="font-medium hover:underline"
                  >
                    {template.name}
                  </Link>
                  {template.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {template.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {FORM_PRESET_LABELS[template.preset as FormPreset] || template.preset}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{template.usageCount}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={template.isActive ? 'active' : 'inactive'} showDot>
                    {template.isActive ? 'Aktiv' : 'Inaktiv'}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(template.updatedAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/contact/${template.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Redigera
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicera
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ta bort
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort mall?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort denna formulärmall? Detta kan
              inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
