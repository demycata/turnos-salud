import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | undefined
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email ?? undefined
  } catch {}

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
