
"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, limit, updateDoc, where, addDoc, deleteDoc, Timestamp } from "firebase/firestore";
import type { CrewMember, InventoryItem, JobSchedule, UserProfile } from "@/types";
import { revalidatePath } from "next/cache";

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    const validated = registerSchema.parse(values);
    
    // Check if this is the first user
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, limit(1));
    const snapshot = await getDocs(q);
    const isFirstUser = snapshot.empty;

    const userCredential = await createUserWithEmailAndPassword(auth, validated.email, validated.password);
    const user = userCredential.user;

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name: validated.name,
      role: isFirstUser ? 'admin' : 'user',
      status: isFirstUser ? 'approved' : 'pending',
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(doc(db, "users", user.uid), userProfile);
    
    const message = isFirstUser 
      ? "Registration successful! You are the admin."
      : "Registration successful! Your account is pending approval.";
    
    revalidatePath('/admin/pending-users');
    return { success: true, message };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid form data." };
    }
    // Check for a specific Firebase error for an existing email
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: "This email address is already registered." };
    }
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}


const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function loginUser(values: z.infer<typeof loginSchema>) {
    try {
      const validated = loginSchema.parse(values);
      const userCredential = await signInWithEmailAndPassword(auth, validated.email, validated.password);
      const user = userCredential.user;
  
      const userDocRef = doc(db, "users", user.uid);
      let userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        return { success: false, message: "User profile not found." };
      }
  
      let userProfile = userDoc.data() as UserProfile;

      // Special check: If there's only one user in the DB and their status is pending,
      // it must be the first user. Let's make them an admin.
      const usersCollection = collection(db, 'users');
      const q = query(collection(db, "users"));
      const allUsersSnapshot = await getDocs(q);

      if (allUsersSnapshot.size === 1 && userProfile.status === 'pending') {
        await updateDoc(userDocRef, {
          status: 'approved',
          role: 'admin',
        });
        // Re-fetch the profile to get the updated values
        userDoc = await getDoc(userDocRef);
        userProfile = userDoc.data() as UserProfile;
      }
  
      if (userProfile.status !== 'approved') {
        await firebaseSignOut(auth);
        let message = 'Your account has not been approved yet.';
        if (userProfile.status === 'rejected') {
          message = 'Your account has been rejected.';
        }
        return { success: false, message };
      }
      
      revalidatePath('/', 'layout');
      return { success: true, message: "Login successful!" };
  
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { success: false, message: "Invalid form data." };
      }
      // Check for specific auth errors to give a better message
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        return { success: false, message: "Invalid email or password." };
      }
      // Fallback for other errors
      return { success: false, message: error.message || "Login failed. Please check your credentials or contact support." };
    }
}

export async function signOut() {
    try {
        await firebaseSignOut(auth);
        revalidatePath('/', 'layout');
        return { success: true, message: "Signed out successfully." };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to sign out." };
    }
}

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export async function sendPasswordResetEmail(values: z.infer<typeof forgotPasswordSchema>) {
    try {
        const validated = forgotPasswordSchema.parse(values);
        await firebaseSendPasswordResetEmail(auth, validated.email);
        return { success: true, message: "Password reset email sent. Please check your inbox." };
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // To prevent email enumeration, we don't reveal if the user exists.
            return { success: true, message: "Password reset email sent. Please check your inbox." };
        }
        return { success: false, message: error.message || "Failed to send reset email." };
    }
}

// User Management Actions
export async function getUsers(): Promise<UserProfile[]> {
  const usersCollection = collection(db, "users");
  const snapshot = await getDocs(usersCollection);
  const users = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
  return users;
}

export async function approveUser(uid: string, role: UserProfile['role']) {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, { status: 'approved', role: role });
    revalidatePath('/admin/pending-users');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function rejectUser(uid: string) {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, { status: 'rejected' });
    revalidatePath('/admin/pending-users');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Crew Management Actions
const crewSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  role: z.enum(["Driver", "Supervisor", "Helper"]),
  contact: z.string().min(10),
});

export async function getCrewMembers(): Promise<CrewMember[]> {
  const crewCollection = collection(db, "crew");
  const snapshot = await getDocs(crewCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CrewMember));
}

export async function addOrUpdateCrewMember(values: z.infer<typeof crewSchema>) {
  try {
    const validated = crewSchema.parse(values);
    const { id, ...data } = validated;

    if (id) {
      await setDoc(doc(db, "crew", id), data, { merge: true });
      revalidatePath('/admin/crew');
      return { success: true, message: "Crew member updated." };
    } else {
      await addDoc(collection(db, "crew"), data);
      revalidatePath('/admin/crew');
      return { success: true, message: "New crew member added." };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCrewMember(id: string) {
  try {
    await deleteDoc(doc(db, "crew", id));
    revalidatePath('/admin/crew');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Inventory Management Actions
const inventorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3),
    sku: z.string().min(3),
    quantity: z.coerce.number().min(0),
    imageUrl: z.string().url().optional().or(z.literal('')),
});

export async function getInventory(): Promise<InventoryItem[]> {
    const invCollection = collection(db, "inventory");
    const snapshot = await getDocs(invCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
}

export async function addOrUpdateInventoryItem(values: z.infer<typeof inventorySchema>) {
    try {
        const validated = inventorySchema.parse(values);
        const { id, ...data } = validated;
        const itemData = {
            ...data,
            lastUpdated: serverTimestamp()
        }

        if (id) {
            await setDoc(doc(db, "inventory", id), itemData, { merge: true });
            revalidatePath('/inventory');
            return { success: true, message: "Inventory item updated." };
        } else {
            await addDoc(collection(db, "inventory"), itemData);
            revalidatePath('/inventory');
            return { success: true, message: "New item added to inventory." };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await deleteDoc(doc(db, "inventory", id));
        revalidatePath('/inventory');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


// Job Scheduling Actions
const jobSchema = z.object({
  id: z.string().optional(),
  taskName: z.string().min(3),
  location: z.string().min(3),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
  status: z.enum(["Pending", "Finished", "Pending Confirmation"]),
  assignedCrew: z.array(z.string()).optional(),
});

export async function getJobs(): Promise<JobSchedule[]> {
    const jobsCollection = collection(db, "jobs");
    const snapshot = await getDocs(query(jobsCollection));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        date: (data.date as Timestamp),
      } as JobSchedule
    });
}

export async function addOrUpdateJob(values: z.infer<typeof jobSchema>) {
    try {
        const validated = jobSchema.parse(values);
        const { id, ...data } = validated;
        
        const jobData = {
            ...data,
            date: Timestamp.fromDate(data.date),
            assignedCrew: data.assignedCrew || [],
        };

        if (id) {
            await setDoc(doc(db, "jobs", id), jobData, { merge: true });
            revalidatePath('/scheduling');
            return { success: true, message: "Job details updated.", jobId: id };
        } else {
            const newDocRef = await addDoc(collection(db, "jobs"), jobData);
            revalidatePath('/scheduling');
            return { success: true, message: "New job created.", jobId: newDocRef.id };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteJob(id: string) {
    try {
        await deleteDoc(doc(db, "jobs", id));
        revalidatePath('/scheduling');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
