"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    href?: string;
    className?: string;
    "aria-label"?: string;
}

export function BackButton({ href, className, "aria-label": ariaLabel = "Go back" }: BackButtonProps) {
    const router = useRouter();

    if (href) {
        return (
            <Link href={href} aria-label={ariaLabel} className={className}>
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={() => router.back()}
            aria-label={ariaLabel}
        >
            <ArrowLeft className="h-4 w-4" />
        </Button>
    );
}

