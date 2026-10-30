import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/auth";
import FirebaseSettings from "@/components/admin/FirebaseSettings";
export default async function Page() {
  if ((await currentAdmin())?.role !== "super_admin") redirect("/admin");
  return <FirebaseSettings />;
}
