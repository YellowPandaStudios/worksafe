import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { MapPin, Plus, Building, Home, Star } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function AddressesPage(): Promise<React.ReactElement> {
  const sessionUser = await getServerUser();
  
  const user = await prisma.user.findUnique({
    where: { id: sessionUser!.id },
    select: {
      defaultBillingAddressId: true,
      defaultShippingAddressId: true,
      addresses: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return <div>Användare hittades inte</div>;
  }

  const billingAddresses = user.addresses.filter((a) => a.type === 'billing' || a.type === 'both');
  const shippingAddresses = user.addresses.filter((a) => a.type === 'shipping' || a.type === 'both');

  const AddressCard = ({ address }: { address: typeof user.addresses[0] }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {address.id === user.defaultBillingAddressId && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" /> Fakturering
              </Badge>
            )}
            {address.id === user.defaultShippingAddressId && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" /> Leverans
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-medium">{address.name}</p>
          {address.company && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building className="h-3 w-3" /> {address.company}
            </p>
          )}
          <p className="text-sm">{address.street}</p>
          {address.street2 && <p className="text-sm">{address.street2}</p>}
          <p className="text-sm">{address.postalCode} {address.city}</p>
          <p className="text-sm">{address.country}</p>
          {address.phone && (
            <p className="text-sm text-muted-foreground">Tel: {address.phone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Adresser</h1>
          <p className="text-muted-foreground">
            Hantera dina fakturerings- och leveransadresser
          </p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Lägg till
        </Button>
      </div>

      {user.addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Inga adresser registrerade</p>
            <p className="text-sm text-muted-foreground">
              Adresser läggs till automatiskt vid första köpet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Home className="h-4 w-4" />
              Faktureringsadresser
            </h3>
            {billingAddresses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen faktureringsadress
                </CardContent>
              </Card>
            ) : (
              billingAddresses.map((address) => (
                <AddressCard key={address.id} address={address} />
              ))
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Leveransadresser
            </h3>
            {shippingAddresses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen leveransadress
                </CardContent>
              </Card>
            ) : (
              shippingAddresses.map((address) => (
                <AddressCard key={address.id} address={address} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
