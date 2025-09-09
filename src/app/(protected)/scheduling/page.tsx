"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Calendar as CalendarIcon, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { JobSchedule, CrewMember } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { addOrUpdateJob, deleteJob, getJobs, getCrewMembers } from "@/lib/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const jobSchema = z.object({
  id: z.string().optional(),
  taskName: z.string().min(3, { message: "Task name must be at least 3 characters." }),
  location: z.string().min(3, { message: "Location is required." }),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)."}),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)."}),
  notes: z.string().optional(),
  status: z.enum(["Pending", "Finished", "Pending Confirmation"]),
  assignedCrew: z.array(z.string()).optional().default([]),
});

export default function SchedulingPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobSchedule[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      taskName: "",
      location: "",
      startTime: "",
      endTime: "",
      notes: "",
      status: 'Pending',
      assignedCrew: [],
    },
  });

  const fetchJobsAndCrew = async () => {
    setLoading(true);
    const [jobs, crew] = await Promise.all([getJobs(), getCrewMembers()]);
    setJobs(jobs);
    setCrewMembers(crew);
    setLoading(false);
  }

  useEffect(() => {
    fetchJobsAndCrew();
  }, []);

  const handleAddNew = () => {
    setEditingJob(null);
    form.reset({ taskName: "", location: "", date: new Date(), startTime: "", endTime: "", notes: "", status: 'Pending', assignedCrew: [] });
    setIsDialogOpen(true);
  };

  const handleEdit = (job: JobSchedule) => {
    setEditingJob(job);
    form.reset({
      ...job,
      date: job.date.toDate(),
      assignedCrew: job.assignedCrew || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteJob(id);
    if (result.success) {
      await fetchJobsAndCrew();
      toast({ title: "Success", description: "Job has been removed from the schedule." });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const onSubmit = async (values: z.infer<typeof jobSchema>) => {
    const result = await addOrUpdateJob(values);
    if (result.success) {
      await fetchJobsAndCrew();
      toast({ title: "Success", description: result.message });
      setIsDialogOpen(false);
      form.reset();
      
      if(result.jobId) {
        const job = { ...values, id: result.jobId };
        handleWhatsAppShare(job);
      }
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
  const handleWhatsAppShare = (job: z.infer<typeof jobSchema>) => {
    const crewDetails = (job.assignedCrew || [])
      .map(id => crewMembers.find(cm => cm.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const message = `
*Job Details:*
*Task:* ${job.taskName}
*Date:* ${format(job.date, "PPP")}
*Time:* ${job.startTime} - ${job.endTime}
*Location:* ${job.location}
*Assigned Crew:* ${crewDetails || 'N/A'}
*Notes:* ${job.notes || 'N/A'}
    `;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message.trim())}`;
    window.open(whatsappUrl, '_blank');
  }
  
  const getStatusVariant = (status: JobSchedule['status']) => {
    switch (status) {
      case 'Finished': return 'default';
      case 'Pending': return 'secondary';
      case 'Pending Confirmation': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scheduling</h1>
            <p className="text-muted-foreground">Create and manage job schedules for your crew.</p>
          </div>
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Create Job</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Upcoming Jobs</CardTitle><CardDescription>View and manage scheduled jobs.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Location</TableHead><TableHead>Assigned Crew</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (<TableRow><TableCell colSpan={7} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : jobs.length > 0 ? (jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.taskName}</TableCell>
                      <TableCell>{format(job.date.toDate(), "PPP")}</TableCell>
                      <TableCell>{job.startTime} - {job.endTime}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.assignedCrew.map(id => crewMembers.find(c => c.id === id)?.name).join(', ')}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(job.status)}>{job.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(job)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleWhatsAppShare(job)}><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this job.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(job.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (<TableRow><TableCell colSpan={7} className="text-center h-24">No jobs scheduled.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingJob ? "Edit Job" : "Create New Job"}</DialogTitle><DialogDescription>{editingJob ? "Update the job details." : "Fill in the details for the new job."}</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <ScrollArea className="h-[500px] p-4">
              <div className="space-y-4">
              <FormField control={form.control} name="taskName" render={({ field }) => (<FormItem><FormLabel>Task Name</FormLabel><FormControl><Input placeholder="e.g., Install new fixture" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus /></PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>)} />
              <div className="flex gap-4">
                <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem className="w-1/2"><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem className="w-1/2"><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional: add any notes for the crew" {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField name="assignedCrew" control={form.control} render={() => (
                <FormItem>
                  <FormLabel>Assign Crew</FormLabel>
                  <div className="space-y-2">
                    {crewMembers.map((member) => (
                      <FormField key={member.id} control={form.control} name="assignedCrew" render={({ field }) => (
                        <FormItem key={member.id} className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(member.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), member.id])
                                  : field.onChange(field.value?.filter((value) => value !== member.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{member.name} ({member.role})</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              </div>
              </ScrollArea>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingJob ? "Save Changes" : "Create Job"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
