'use client';

import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Package, ExternalLink, TrendingUp, ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
  items: OrderItem[];
}

interface UserOrdersTabProps {
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
}

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

export function UserOrdersTab({ orders, totalOrders, totalSpent }: UserOrdersTabProps): React.ReactElement {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Totala ordrar</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {totalOrders}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Totalt spenderat</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              {formatCurrency(totalSpent)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Genomsnittligt ordervärde</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              {totalOrders > 0 ? formatCurrency(totalSpent / totalOrders) : '0 kr'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orderhistorik</CardTitle>
          <CardDescription>
            Visar de senaste {orders.length} av {totalOrders} ordrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Inga ordrar ännu</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {orders.map((order) => (
                <AccordionItem key={order.id} value={order.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm">{order.orderNumber}</span>
                        <Badge variant={STATUS_VARIANTS[order.status] || 'outline'}>
                          {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {order.itemCount} {order.itemCount === 1 ? 'artikel' : 'artiklar'}
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="text-muted-foreground">
                          {format(new Date(order.createdAt), 'PP', { locale: sv })}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produkt</TableHead>
                            <TableHead className="text-right">Antal</TableHead>
                            <TableHead className="text-right">Pris</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCurrency(item.totalPrice)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={2} className="font-medium">Totalt</TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(order.total)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visa order
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
