"use client";

import { useMemo, useState } from "react";

const timezoneChoices = ["Africa/Nairobi", "Europe/London", "America/New_York", "Asia/Dubai"];
const languageChoices = ["English", "Swahili"];

type FormValues = {
    name: string;
    email: string;
    timezone: string;
    language: string;
};

export function useProfileForm(initial: { name: string; email: string }) {
    const [form, setForm] = useState<FormValues>({
        name: initial.name,
        email: initial.email,
        timezone: timezoneChoices[0],
        language: languageChoices[0],
    });
    const [saving, setSaving] = useState(false);

    const handleChange =
        (field: keyof FormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setSaving(false);
    };

    const timezones = useMemo(() => timezoneChoices, []);
    const languages = useMemo(() => languageChoices, []);

    return {
        form,
        saving,
        handleChange,
        handleSubmit,
        timezones,
        languages,
    };
}

