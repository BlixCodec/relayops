import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRelayStore } from "@/lib/relay/store";

export const Route = createFileRoute("/_app/manager")({
  beforeLoad: () => {
    const role = useRelayStore.getState().role;
    if (role !== "manager") {
      useRelayStore.getState().setRole("manager");
    }
  },
  component: () => <Outlet />,
});
