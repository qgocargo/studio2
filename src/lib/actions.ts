
"use server";

import { redirect } from "next/navigation";
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = "__session";

// This function is now only used on the client-side after a successful login.
// We will call this via a server action from the client.
export async function createSession(uid: string) {
  cookies().set(SESSION_COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  
  // After setting the cookie, we need to redirect.
  // Since this is a server action, we can call redirect here.
  redirect("/");
}


export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
