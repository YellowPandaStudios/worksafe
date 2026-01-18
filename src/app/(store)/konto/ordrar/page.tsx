import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Väntar',
  confirmed: 'Bekräftad',
  processing: 'Bearbetas',
  shipped: 'Skickad',
  delivered: 'Levererad',
  completed: 'Avslutad',
  cancelled: 'Avbruten',
  refunded: 'Återbetalad',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'secondary',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'default',
  completed: 'default',
  cancelled: 'destructive',
  refunded: 'destructive',
};

export default async function OrdersPage(): Promise<React.ReactElement> {
  const sessionUser = await getServerUser();
  
  const orders = await prisma.order.findMany({
    where: { userId: sessionUser!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          name: true,
          quantity: true,
        },
      },
    },
  });

  const formatCurrency = (amount: number | bigint | { toNumber(): number }): string => {
    const num = typeof amount === 'bigint' ? Number(amount) : 
                typeof amount === 'object' && 'toNumber' in amount ? amount.toNumber() : amount;
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
    }).format(num as number);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ordrar</h1>
        <p className="text-muted-foreground">
          Din orderhistorik
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Inga ordrar ännu</p>
            <Button asChild className="mt-4">
              <Link href="/butik">Börja handla</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(order.createdAt, 'PPP', { locale: sv })}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[order.status] || 'outline'}>
                    {STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.items.length - 3} fler produkter
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="font-medium">
                    Totalt: {formatCurrency(order.total)}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/konto/ordrar/${order.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visa detaljer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
