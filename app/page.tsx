import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import GroupsDashboard from "@/components/GroupsDashboard";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <GroupsDashboard userName={user.name} />;
}
