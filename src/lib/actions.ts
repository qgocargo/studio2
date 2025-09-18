
"use server";

import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = "__session";

async function createSession(uid: string) {
  // In a real app, you would create a custom token and set it in a secure, httpOnly cookie.
  // For this prototype, we will set a simple cookie with the user's UID.
  cookies().set(SESSION_COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { message: "Please enter both email and password." };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createSession(userCredential.user.uid);
    redirect("/");
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return { message: "Invalid email or password." };
    }
    return { message: "An error occurred. Please try again." };
  }
}

export async function signUp(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password || !name) {
        return { message: "Please fill all fields." };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Here you would typically also save the user's name to Firestore.
        await createSession(userCredential.user.uid);
        redirect("/");
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { message: "This email is already in use." };
        }
        return { message: "An error occurred during sign up." };
    }
}


export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
