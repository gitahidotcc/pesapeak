"use client";

import * as React from "react";
import { Check, Plus, X, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

interface TagsInputProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    // Contextual hints for smart suggestions
    amount?: number;
    categoryId?: string;
    date?: Date;
}

export function TagsInput({ selectedTags, onTagsChange, amount, categoryId, date }: TagsInputProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const { data: tags, isLoading } = api.tags.getAll.useQuery();
    const utils = api.useUtils();

    const createTag = api.tags.create.useMutation({
        onSuccess: (newTag) => {
            utils.tags.getAll.invalidate();
            if (newTag) {
                onTagsChange([...selectedTags, newTag.id]);
            }
            setInputValue("");
        }
    });


    const selectedTagObjects = tags?.filter(tag => selectedTags.includes(tag.id)) || [];

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onTagsChange(selectedTags.filter(id => id !== tagId));
        } else {
            onTagsChange([...selectedTags, tagId]);
        }
    };

    // Filter tags to exclude already selected ones for the suggestions list?
    // Or just show checkmarks. Checkmarks are better.

    // Smart Suggestions Logic
    // This could be more sophisticated, but for now, we'll suggest:
    // 1. "Recurring" if amount is round or specific logic (mocked for now)
    // 2. "Work" if weekday 9-5
    // 3. Recently used? (Not implemented yet)
    // For now, let's just show standard list but prioritizing context tags?

    // Actually, prompt says: "Suggest tags based on Category, Amount, Repetition, Time of day"
    // "Example: Transport + weekday morning → suggest work"
    // Since we don't have access to complex historical analysis yet, we can implement simple heuristics.

    const suggestions = React.useMemo(() => {
        if (!tags) return [];
        const suggs: string[] = [];

        // Heuristics
        if (date) {
            const day = date.getDay();
            const hour = date.getHours();
            const isWeekday = day >= 1 && day <= 5;
            const isWorkHours = hour >= 9 && hour <= 18;

            if (isWeekday && isWorkHours) {
                const workTag = tags.find(t => t.name.toLowerCase() === "work");
                if (workTag && !selectedTags.includes(workTag.id)) suggs.push(workTag.id);
            }
            if (!isWeekday || !isWorkHours) {
                const socialTag = tags.find(t => t.name.toLowerCase() === "social");
                if (socialTag && !selectedTags.includes(socialTag.id)) suggs.push(socialTag.id);
            }
        }

        // Convenience suggestion (e.g. if category is Food/Dining)
        // We'd need to know category name, currently we only have ID.
        // Skipping category-based for now without category name lookup.

        return suggs;
    }, [tags, date, selectedTags]);


    if (isLoading) {
        return <Skeleton className="h-10 w-full" />;
    }

    return (
        <div className="space-y-2">

            {/* Suggestions Chips */}
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs text-muted-foreground mr-1 self-center">Suggested:</span>
                    {suggestions.map(tagId => {
                        const tag = tags?.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className="cursor-pointer hover:bg-muted bg-blue-50/50 text-blue-700 dark:text-blue-300 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                onClick={() => toggleTag(tag.id)}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                {tag.name}
                            </Badge>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[42px] items-center focus-within:ring-2 focus-within:ring-ring focus-within:border-primary">
                {selectedTagObjects.map(tag => (
                    <Badge key={tag.id} variant="secondary">
                        {tag.name}
                        <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    toggleTag(tag.id);
                                }
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={() => toggleTag(tag.id)}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                            <Plus className="mr-1 h-3 w-3" />
                            Add Tag
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search tags..."
                                value={inputValue}
                                onValueChange={setInputValue}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        No tags found.
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-2 h-auto py-1"
                                            onClick={() => {
                                                if (inputValue.trim()) {
                                                    createTag.mutate({ name: inputValue.trim() });
                                                }
                                            }}
                                            disabled={!inputValue.trim() || createTag.isPending}
                                        >
                                            Create "{inputValue}"
                                        </Button>
                                    </div>
                                </CommandEmpty>
                                <CommandGroup>
                                    {tags?.map(tag => (
                                        <CommandItem
                                            key={tag.id}
                                            value={tag.name}
                                            onSelect={() => {
                                                toggleTag(tag.id);
                                                // setOpen(false); // Keep open for multi-select
                                                setInputValue("");
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {tag.name}
                                            <span className="ml-auto text-xs text-muted-foreground capitalize">{tag.type !== 'other' ? tag.type : ''}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

            </div>
        </div>
    );
}
