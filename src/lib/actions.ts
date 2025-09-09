"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, limit } from "firebase/firestore";
import type { UserProfile } from "@/types";
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
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);
    
    const message = isFirstUser 
      ? "Registration successful! You have been registered as the first admin user."
      : "Registration successful! Your account is pending approval.";
    
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
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        return { success: false, message: "User profile not found." };
      }
  
      const userProfile = userDoc.data() as UserProfile;
  
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
      return { success: false, message: "Invalid credentials or user not approved." };
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
