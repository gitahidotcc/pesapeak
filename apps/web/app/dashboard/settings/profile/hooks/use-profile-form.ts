"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { api } from "@/lib/trpc";
import { languages as supportedLanguages } from "@/lib/i18n/settings";
import { profileFormSchema, timezoneChoices, type ProfileFormValues } from "@/app/dashboard/settings/profile/validations/profile-form-schema";
import { toast } from "sonner";

export function useProfileForm() {
    const utils = api.useContext();
    const { data: profile, isLoading: isLoadingProfile } = api.users.profile.useQuery();
    const updateProfile = api.users.updateProfile.useMutation({
        onSuccess: () => {
            void utils.users.profile.invalidate();
            toast.success("Profile updated");
        },
        onError: () => {
            toast.error("Unable to update profile");
        },
    });

    const [form, setForm] = useState<ProfileFormValues>({
        name: "",
        email: "",
        timezone: timezoneChoices[0],
        language: supportedLanguages[0] ?? "en",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});

    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name,
                email: profile.email,
                timezone: profile.timezone ?? timezoneChoices[0],
                language: profile.language ?? supportedLanguages[0] ?? "en",
            });
        }
    }, [profile]);

    const handleChange =
        (field: keyof ProfileFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = profileFormSchema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
            parsed.error.issues.forEach((issue) => {
                const key = issue.path[0];
                if (typeof key === "string") {
                    fieldErrors[key as keyof ProfileFormValues] = issue.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        await updateProfile.mutateAsync(parsed.data);
    };

    const timezones = useMemo(() => timezoneChoices, []);
    const languages = useMemo(() => supportedLanguages, []);

    return {
        form,
        handleChange,
        handleSubmit,
        saving: updateProfile.isPending,
        timezones,
        languages,
        isLoading: isLoadingProfile,
        errors,
    };
}

