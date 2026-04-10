import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | undefined
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email ?? undefined
  } catch {
    // No session — middleware will redirect, this is just for the email display
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
