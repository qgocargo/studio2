
"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, limit, updateDoc, where } from "firebase/firestore";
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
      ? "Registration successful! You are the admin."
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
