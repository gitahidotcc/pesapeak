"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { langNameMappings } from "@pesapeak/shared/langs";
import { useProfileForm } from "@/app/dashboard/settings/profile/hooks/use-profile-form";
import { formatTimezoneOffset } from "@/app/dashboard/settings/profile/utils/timezone-labels";

export function ProfileForm() {
    const { form, handleChange, handleSubmit, saving, timezones, languages, isLoading, errors } =
        useProfileForm();
    const disabled = saving || isLoading;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6">
            <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Personal details</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Full name</span>
                    <Input
                        value={form.name}
                        onChange={handleChange("name")}
                        placeholder="Your full name"
                        disabled={disabled}
                    />
                    {errors?.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </label>

                <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Email address</span>
                    <Input
                        value={form.email}
                        onChange={handleChange("email")}
                        type="email"
                        placeholder="name@company.com"
                        disabled={disabled}
                    />
                    {errors?.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Timezone</span>
                    <select
                        value={form.timezone}
                        onChange={handleChange("timezone")}
                        disabled={disabled}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                    >
                        {timezones.map((zone) => (
                            <option key={zone} value={zone}>
                                {`${zone} (${formatTimezoneOffset(zone)} hrs)`}
                            </option>
                        ))}
                    </select>
                    {errors?.timezone && <p className="text-xs text-destructive">{errors.timezone}</p>}
                </label>
                <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Language</span>
                    <select
                        value={form.language}
                        onChange={handleChange("language")}
                        disabled={disabled}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                    >
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>
                                {langNameMappings[lang] ?? lang}
                            </option>
                        ))}
                    </select>
                    {errors?.language && <p className="text-xs text-destructive">{errors.language}</p>}
                </label>
            </div>

            <Button type="submit" className="w-full">
                {saving ? "Saving..." : "Save changes"}
            </Button>
        </form>
    );
}

