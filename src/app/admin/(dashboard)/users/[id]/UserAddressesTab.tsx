'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { MapPin, Home, Building, Star, Trash2, Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddressForm } from './AddressForm';

interface Address {
  id: string;
  type: string;
  isDefault: boolean;
  name: string;
  company: string | null;
  street: string;
  street2: string | null;
  city: string;
  postalCode: string;
  country: string;
  phone: string | null;
  createdAt: string;
}

interface UserAddressesTabProps {
  userId: string;
  addresses: Address[];
  defaultBillingId: string | null;
  defaultShippingId: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  billing: 'Fakturering',
  shipping: 'Leverans',
  both: 'Fakturering & Leverans',
};

export function UserAddressesTab({ 
  userId, 
  addresses, 
  defaultBillingId, 
  defaultShippingId 
}: UserAddressesTabProps): React.ReactElement {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const billingAddresses = addresses.filter((a) => a.type === 'billing' || a.type === 'both');
  const shippingAddresses = addresses.filter((a) => a.type === 'shipping' || a.type === 'both');

  const handleDelete = async (): Promise<void> => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/addresses/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kunde inte ta bort adressen');
      }

      toast.success('Adressen har tagits bort');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ett fel uppstod');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string, type: 'billing' | 'shipping'): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/addresses/${addressId}/set-default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Kunde inte sätta som standard');
      }

      toast.success(`Satt som standard ${type === 'billing' ? 'fakturerings' : 'leverans'}adress`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ett fel uppstod');
    }
  };

  const AddressCard = ({ address, showSetDefault }: { address: Address; showSetDefault?: 'billing' | 'shipping' }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {address.type === 'shipping' ? (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Home className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge variant="outline">{TYPE_LABELS[address.type] || address.type}</Badge>
            {address.id === defaultBillingId && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" /> Fakturering
              </Badge>
            )}
            {address.id === defaultShippingId && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" /> Leverans
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeletingId(address.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="font-medium">{address.name}</p>
          {address.company && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building className="h-3 w-3" /> {address.company}
            </p>
          )}
        </div>
        <div className="text-sm">
          <p>{address.street}</p>
          {address.street2 && <p>{address.street2}</p>}
          <p>{address.postalCode} {address.city}</p>
          <p>{address.country}</p>
        </div>
        {address.phone && (
          <p className="text-sm text-muted-foreground">Tel: {address.phone}</p>
        )}
        <p className="text-xs text-muted-foreground pt-2">
          Tillagd: {format(new Date(address.createdAt), 'PP', { locale: sv })}
        </p>
        
        {showSetDefault && address.id !== (showSetDefault === 'billing' ? defaultBillingId : defaultShippingId) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => handleSetDefault(address.id, showSetDefault)}
          >
            <Star className="h-3 w-3 mr-1" />
            Sätt som standard
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Adresser</h3>
          <p className="text-sm text-muted-foreground">
            Hantera användarens fakturerings- och leveransadresser
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Lägg till adress
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Lägg till adress</DialogTitle>
              <DialogDescription>
                Lägg till en ny adress för användaren
              </DialogDescription>
            </DialogHeader>
            <AddressForm 
              userId={userId} 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                router.refresh();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Inga adresser registrerade</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Home className="h-4 w-4" />
              Faktureringsadresser
            </h4>
            {billingAddresses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen faktureringsadress
                </CardContent>
              </Card>
            ) : (
              billingAddresses.map((address) => (
                <AddressCard key={address.id} address={address} showSetDefault="billing" />
              ))
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Leveransadresser
            </h4>
            {shippingAddresses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen leveransadress
                </CardContent>
              </Card>
            ) : (
              shippingAddresses.map((address) => (
                <AddressCard key={address.id} address={address} showSetDefault="shipping" />
              ))
            )}
          </div>
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort adress?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort denna adress? Detta kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
