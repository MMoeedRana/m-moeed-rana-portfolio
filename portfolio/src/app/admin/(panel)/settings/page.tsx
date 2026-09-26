import { PasswordForm, ProfileForm } from "@/components/admin/SettingsForms";
import { requireAdmin } from "@/lib/auth";
export default async function SettingsPage() {
  const a = await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Settings</h1>
      <ProfileForm name={a.name} email={a.email} />
      <PasswordForm />
    </div>
  );
}
