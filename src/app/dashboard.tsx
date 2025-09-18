
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobFileForm } from "./job-file-form";

interface User {
    uid: string;
    displayName: string;
    role: string;
}

interface DashboardProps {
    user: User;
}

interface StatusSummary {
    approved: number;
    rejected: number;
    checked: number;
    pending: number;
    [key: string]: number; // Index signature
}

export default function Dashboard({ user }: DashboardProps) {
    const [statusSummary, setStatusSummary] = useState<StatusSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getDashboardData() {
            try {
                setLoading(true);
                const jobfilesCollection = collection(db, "jobfiles");
                const jobfilesSnapshot = await getDocs(jobfilesCollection);
                
                const summary: StatusSummary = {
                    approved: 0,
                    rejected: 0,
                    checked: 0,
                    pending: 0,
                };

                jobfilesSnapshot.forEach((jobfileDoc) => {
                    const status = jobfileDoc.data().status?.toLowerCase();
                    if (status && status in summary) {
                        summary[status]++;
                    }
                });

                setStatusSummary(summary);
            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError("Could not load dashboard data. " + err.message);
            } finally {
                setLoading(false);
            }
        }

        getDashboardData();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card className="bg-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">
                    Approved
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                    {statusSummary?.approved}
                    </div>
                </CardContent>
                </Card>
                <Card className="bg-red-100 border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">
                    Rejected
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-900">
                    {statusSummary?.rejected}
                    </div>
                </CardContent>
                </Card>
                <Card className="bg-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">
                    Checked
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                    {statusSummary?.checked}
                    </div>
                </CardContent>
                </Card>
                <Card className="bg-yellow-100 border-yellow-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-900">
                    Pending
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-900">
                    {statusSummary?.pending}
                    </div>
                </CardContent>
                </Card>
            </div>
            <JobFileForm user={user} />
        </>
    );
}

