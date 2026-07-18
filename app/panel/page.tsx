import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PanelApp } from "../ui/panel-app";
import { readSession, SESSION_COOKIE } from "../../lib/auth";

export default async function PanelPage() {
  const cookieStore = await cookies();
  const session = readSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/");
  return <PanelApp role={session.role} />;
}
