"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem } from "@/types";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";

const inventorySchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
  sku: z.string().min(3, { message: "SKU must be at least 3 characters." }),
  quantity: z.coerce.number().min(0, { message: "Quantity must be a positive number." }),
});

const initialInventory: InventoryItem[] = [
    { id: '1', name: 'Power Drill', sku: 'PD-001', quantity: 15, lastUpdated: Timestamp.now(), imageUrl: 'https://picsum.photos/40/40?random=1' },
    { id: '2', name: 'Hammer', sku: 'HM-002', quantity: 30, lastUpdated: Timestamp.now(), imageUrl: 'https://picsum.photos/40/40?random=2' },
    { id: '3', name: 'Screwdriver Set', sku: 'SS-003', quantity: 25, lastUpdated: Timestamp.now(), imageUrl: 'https://picsum.photos/40/40?random=3' },
    { id: '4', name: 'Wrench Set', sku: 'WS-004', quantity: 20, lastUpdated: Timestamp.now(), imageUrl: 'https://picsum.photos/40/40?random=4' },
];

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      sku: "",
      quantity: 0,
    },
  });

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ name: "", sku: "", quantity: 0 });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
    toast({
        title: "Success",
        description: "Inventory item removed.",
      });
  };

  const onSubmit = (values: z.infer<typeof inventorySchema>) => {
    if (editingItem) {
      // Update existing item
      setInventory(
        inventory.map((item) =>
          item.id === editingItem.id ? { ...item, ...values, lastUpdated: Timestamp.now() } : item
        )
      );
      toast({
        title: "Success",
        description: "Item details updated.",
      });
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: (inventory.length + 1).toString(), // simple id generation
        ...values,
        lastUpdated: Timestamp.now(),
        imageUrl: `https://picsum.photos/40/40?random=${inventory.length + 1}`
      };
      setInventory([...inventory, newItem]);
      toast({
        title: "Success",
        description: "New item added to inventory.",
      });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
                Manage your equipment and supplies.
            </p>
            </div>
            <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Inventory List</CardTitle>
            <CardDescription>Search and manage your items.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Image src={item.imageUrl || `https://picsum.photos/40/40`} alt={item.name} width={40} height={40} className="rounded-md" data-ai-hint="tool equipment" />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.lastUpdated.toDate().toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details of this inventory item." : "Fill in the details for the new item."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Power Drill" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PD-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Save Changes" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
