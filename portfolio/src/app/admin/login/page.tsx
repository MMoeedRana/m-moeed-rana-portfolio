import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm rounded-[20px] border border-border bg-deep p-6 shadow-[0_0_70px_var(--p12)] sm:p-8">
        <div className="brand mb-6">
          <span className="mark">MR</span>Admin login
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
