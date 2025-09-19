
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JobFile } from './dashboard';

interface JobFilesTableProps {
  files: JobFile[];
}

const statusColors: { [key: string]: string } = {
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  checked: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
};


export function JobFilesTable({ files }: JobFilesTableProps) {
  if (!files || files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Job Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No job files found in the database.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Job Files</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job File No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Shipper's Name</TableHead>
              <TableHead>Consignee's Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.jobFileNo || 'N/A'}</TableCell>
                <TableCell>{file.date || 'N/A'}</TableCell>
                <TableCell>{file.shipperName || 'N/A'}</TableCell>
                <TableCell>{file.consigneeName || 'N/A'}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={`capitalize ${statusColors[file.status] || ''}`}
                  >
                    {file.status || 'N/A'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
