import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/pending-users')
}
