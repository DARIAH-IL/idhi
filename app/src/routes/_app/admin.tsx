import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'
import { AdminManagementPage } from '@/components/admin/AdminManagementPage'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/_app/admin')({
  beforeLoad: () => {
    if (!useAuthStore.getState().user?.isAdmin) {
      throw redirect({ to: '/entities' })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  const isAdmin = useAuthStore((state) => state.user?.isAdmin === true)

  if (!isAdmin) {
    return <Navigate to="/entities" replace />
  }

  return <AdminManagementPage />
}
