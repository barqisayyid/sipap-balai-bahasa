import { BottomNav } from "@/components/layout/bottom-nav";
import { bolehKelolaAgenda, wajibLogin } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profil = await wajibLogin();

  return (
    <>
      <div className="pb-28">{children}</div>
      <BottomNav bolehTambah={bolehKelolaAgenda(profil.role)} />
    </>
  );
}
