
"use server";

import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { initAdminApp } from './firebase/firebase-admin';

// This function is now used to create a session cookie after client-side login.
export async function createSession(idToken: string) {
  await initAdminApp();
  
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

  cookies().set("__session", sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  
  redirect("/");
}


export async function signOut() {
  cookies().delete("__session");
  redirect('/login');
}
