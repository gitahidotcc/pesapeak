import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import { ProfileForm } from "./components/profile-form";

const heroText = {
    headline: "Profile",
    subhead: "Update the personal details that power your Pesapeak experience.",
};

export default async function ProfilePage() {
    const session = await getServerSession();

    const user = session?.user;

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Settings</p>
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">{heroText.headline}</h1>
                        <p className="text-sm text-muted-foreground max-w-2xl">{heroText.subhead}</p>
                    </div>
                </div>
            </header>

            <ProfileForm initialName={user?.name ?? ""} initialEmail={user?.email ?? ""} />
        </div>
    );
}

