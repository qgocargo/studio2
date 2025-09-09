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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { CrewMember, CrewRole } from "@/types";

const crewSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  role: z.enum(["Driver", "Supervisor", "Helper"], {
    errorMap: () => ({ message: "Please select a role." }),
  }),
  contact: z.string().min(10, { message: "Please enter a valid contact number or email." }),
});

const initialCrew: CrewMember[] = [
    { id: '1', name: 'John Doe', role: 'Supervisor', contact: 'john.d@example.com'},
    { id: '2', name: 'Jane Smith', role: 'Driver', contact: '555-1234'},
    { id: '3', name: 'Mike Ross', role: 'Helper', contact: 'mike.r@example.com'},
    { id: '4', name: 'Rachel Zane', role: 'Driver', contact: '555-5678'},
];

export default function CrewPage() {
  const { toast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(initialCrew);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);

  const form = useForm<z.infer<typeof crewSchema>>({
    resolver: zodResolver(crewSchema),
    defaultValues: {
      name: "",
      role: undefined,
      contact: "",
    },
  });

  const handleAddNew = () => {
    setEditingCrew(null);
    form.reset({ name: "", role: undefined, contact: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (crew: CrewMember) => {
    setEditingCrew(crew);
    form.reset(crew);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setCrewMembers(crewMembers.filter((crew) => crew.id !== id));
    toast({
        title: "Success",
        description: "Crew member removed.",
      });
  };

  const onSubmit = (values: z.infer<typeof crewSchema>) => {
    if (editingCrew) {
      // Update existing crew member
      setCrewMembers(
        crewMembers.map((crew) =>
          crew.id === editingCrew.id ? { ...crew, ...values } : crew
        )
      );
      toast({
        title: "Success",
        description: "Crew member details updated.",
      });
    } else {
      // Add new crew member
      const newCrew: CrewMember = {
        id: (crewMembers.length + 1).toString(), // simple id generation
        ...values,
      };
      setCrewMembers([...crewMembers, newCrew]);
      toast({
        title: "Success",
        description: "New crew member added.",
      });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Crew Members</CardTitle>
            <CardDescription>
              Add, edit, and assign roles to your crew.
            </CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Crew Member
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crewMembers.map((crew) => (
                <TableRow key={crew.id}>
                  <TableCell className="font-medium">{crew.name}</TableCell>
                  <TableCell>{crew.role}</TableCell>
                  <TableCell>{crew.contact}</TableCell>
                  <TableCell className="text-right">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(crew)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(crew.id)} className="text-destructive">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCrew ? "Edit Crew Member" : "Add New Crew Member"}</DialogTitle>
            <DialogDescription>
              {editingCrew ? "Update the details of this crew member." : "Fill in the details for the new crew member."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Driver">Driver</SelectItem>
                        <SelectItem value="Helper">Helper</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Info</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone or email" {...field} />
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
                  {editingCrew ? "Save Changes" : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
