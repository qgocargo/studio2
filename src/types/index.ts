import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export type CrewRole = 'Driver' | 'Supervisor' | 'Helper';

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  contact: string;
}

export interface InventoryItem {
  id: string;
  name:string;
  sku: string;
  quantity: number;
  imageUrl?: string;
  lastUpdated: Timestamp;
}

export type JobStatus = 'Pending' | 'Finished' | 'Pending Confirmation';

export interface JobSchedule {
  id: string;
  taskName: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
  status: JobStatus;
  assignedCrew: string[]; // array of crew member ids
}
