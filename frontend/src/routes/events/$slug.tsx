import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/events/$slug')({
  component: () => <Outlet />,
})