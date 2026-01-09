import { checkRole } from "@/lib/check-role";

export default async function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkRole("authority");
  return <>{children}</>;
}
