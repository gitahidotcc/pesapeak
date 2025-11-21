"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { listSessions, revokeSession, revokeOtherSessions } from "@/lib/auth-client";
import { toast } from "sonner";
import { Monitor, Smartphone, Tablet, Globe, Trash2, Shield } from "lucide-react";

interface Session {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date | null;
    ipAddress?: string | null;
    userAgent?: string | null;
}

function getDeviceIcon(userAgent?: string | null) {
    if (!userAgent) return Globe;

    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        return Smartphone;
    }
    if (ua.includes("tablet") || ua.includes("ipad")) {
        return Tablet;
    }
    return Monitor;
}

function getDeviceInfo(userAgent?: string | null) {
    if (!userAgent) return { browser: "Unknown Browser", os: "Unknown OS" };

    const ua = userAgent;

    // Extract browser
    let browser = "Unknown Browser";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";

    // Extract OS
    let os = "Unknown OS";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return { browser, os };
}

function formatDate(date: Date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
}

export function ActiveSessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
    const [isRevokingAll, setIsRevokingAll] = useState(false);

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const result = await listSessions();

            if (result.error) {
                toast.error("Failed to load sessions");
                return;
            }

            // Get current session token from cookies
            const cookies = document.cookie.split(";");
            const sessionCookie = cookies.find((c) => c.trim().startsWith("better-auth.session_token="));
            const token = sessionCookie?.split("=")[1];
            setCurrentSessionToken(token || null);

            setSessions(result.data || []);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast.error("Failed to load sessions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevokeSession = async (sessionId: string) => {
        setRevokingSessionId(sessionId);

        try {
            const result = await revokeSession({ token: sessionId });

            if (result.error) {
                toast.error("Failed to revoke session");
                return;
            }

            toast.success("Session revoked successfully");
            await fetchSessions();
        } catch (error) {
            console.error("Failed to revoke session:", error);
            toast.error("Failed to revoke session");
        } finally {
            setRevokingSessionId(null);
        }
    };

    const handleRevokeAllOthers = async () => {
        setIsRevokingAll(true);

        try {
            const result = await revokeOtherSessions();

            if (result.error) {
                toast.error("Failed to revoke sessions");
                return;
            }

            toast.success("All other sessions revoked successfully");
            await fetchSessions();
        } catch (error) {
            console.error("Failed to revoke sessions:", error);
            toast.error("Failed to revoke sessions");
        } finally {
            setIsRevokingAll(false);
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Active Sessions</h2>
                        <p className="text-sm text-muted-foreground">
                            Loading your active sessions...
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    const otherSessions = sessions.filter((s) => s.token !== currentSessionToken);

    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Active Sessions</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage devices where you're signed in
                        </p>
                    </div>
                </div>
                {otherSessions.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevokeAllOthers}
                        disabled={isRevokingAll}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                        {isRevokingAll ? "Revoking..." : "Revoke All Others"}
                    </Button>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No active sessions found
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => {
                        const isCurrentSession = session.token === currentSessionToken;
                        const DeviceIcon = getDeviceIcon(session.userAgent);
                        const { browser, os } = getDeviceInfo(session.userAgent);
                        const lastActive = session.updatedAt || session.createdAt;

                        return (
                            <div
                                key={session.id}
                                className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${isCurrentSession
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border bg-muted/30 hover:bg-muted/50"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isCurrentSession ? "bg-primary/20" : "bg-muted"
                                        }`}>
                                        <DeviceIcon className={`h-6 w-6 ${isCurrentSession ? "text-primary" : "text-muted-foreground"
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-foreground">
                                                {browser} on {os}
                                            </p>
                                            {isCurrentSession && (
                                                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {session.ipAddress && (
                                                <>
                                                    <Globe className="h-3 w-3" />
                                                    <span>{session.ipAddress}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>Last active {formatDate(lastActive)}</span>
                                        </div>
                                    </div>
                                </div>

                                {!isCurrentSession && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRevokeSession(session.token)}
                                        disabled={revokingSessionId === session.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                        {revokingSessionId === session.id ? (
                                            "Revoking..."
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Revoke
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
