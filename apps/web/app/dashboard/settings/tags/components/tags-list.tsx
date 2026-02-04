"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Tag as TagIcon, MoreHorizontal, Search } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditTagDialog } from "./edit-tag-dialog";
import { type TagFormData } from "../validations/tag-form";
import { Skeleton } from "@/components/ui/skeleton";

function toTagType(value: string | null | undefined): TagFormData["type"] {
    if (value === "context" || value === "frequency" || value === "emotion" || value === "other") return value;
    return "other";
}

export function TagsList() {
    const { data: tags, isLoading } = api.tags.getAll.useQuery();
    const [editingTag, setEditingTag] = useState<{ id: string; name: string; type: TagFormData["type"] } | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const utils = api.useUtils();

    const deleteTag = api.tags.delete.useMutation({
        onSuccess: () => {
            utils.tags.getAll.invalidate();
            setDeleteId(null);
        }
    });

    if (isLoading) {
        return <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    }

    if (!tags || tags.length === 0) {
        return <div className="text-muted-foreground text-sm">No tags found. Create one to get started.</div>
    }

    // Filter tags based on search
    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 1. Most Used (Top 5, must have usage > 0)
    // Only show most used if NOT searching, or maybe always? Usually most used is a dashboard view.
    // If searching, simple list is better.
    // Let's show "Most Used" only when no search query.
    const mostUsedTags = searchQuery ? [] : [...tags]
        .sort((a, b) => b.usageCount - a.usageCount)
        .filter(t => t.usageCount > 0)
        .slice(0, 5);

    // 2. Alphabetical List (All tags, or excluding most used? Usually all tags for easy finding)
    // "ordered via aplhabet"
    // Let's group all filtered tags alphabetically.
    const sortedTags = [...filteredTags].sort((a, b) => a.name.localeCompare(b.name));

    const contextMap = sortedTags.reduce((acc, tag) => {
        const firstLetter = tag.name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(tag);
        return acc;
    }, {} as Record<string, typeof tags>);

    const alphabet = Object.keys(contextMap).sort();

    const TagItem = ({ tag }: { tag: typeof tags[0] }) => (
        <div className="flex items-center justify-between p-3 border-b last:border-0 bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                    <TagIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium">{tag.name}</span>
                    {tag.usageCount > 0 && (
                        <span className="text-xs text-muted-foreground">{tag.usageCount} transactions</span>
                    )}
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingTag({ id: tag.id, name: tag.name, type: toTagType(tag.type) })}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(tag.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tags..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Most Used Section */}
            {mostUsedTags.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Most Used</h3>
                    <div className="rounded-xl border bg-card overflow-hidden">
                        {mostUsedTags.map(tag => (
                            <TagItem key={`most-used-${tag.id}`} tag={tag} />
                        ))}
                    </div>
                </div>
            )}

            {/* Alphabetical Sections */}
            {alphabet.length > 0 ? (
                <div className="space-y-4">
                    {alphabet.map(letter => (
                        <div key={letter} className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground px-1">{letter}</h3>
                            <div className="rounded-xl border bg-card overflow-hidden">
                                {contextMap[letter].map(tag => (
                                    <TagItem key={tag.id} tag={tag} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                searchQuery && <div className="text-center py-8 text-muted-foreground">No tags found matching "{searchQuery}"</div>
            )}

            {editingTag && (
                <EditTagDialog
                    open={!!editingTag}
                    onOpenChange={(open) => !open && setEditingTag(null)}
                    tag={editingTag}
                />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tag and remove it from all associated transactions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && deleteTag.mutate({ id: deleteId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
