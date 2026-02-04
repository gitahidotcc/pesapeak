"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { tagFormSchema, type TagFormData } from "../validations/tag-form";

interface EditTagDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tag: { id: string; name: string; type: TagFormData["type"] };
}

export function EditTagDialog({ open, onOpenChange, tag }: EditTagDialogProps) {
    const utils = api.useUtils();

    const form = useForm<TagFormData>({
        resolver: zodResolver(tagFormSchema),
        defaultValues: {
            name: tag.name,
            type: tag.type,
        },
    });

    // Reset form when tag changes
    useEffect(() => {
        if (open) {
            form.reset({
                name: tag.name,
                type: tag.type,
            });
        }
    }, [open, tag, form]);

    const updateTag = api.tags.update.useMutation({
        onSuccess: () => {
            toast.success("Tag updated successfully");
            onOpenChange(false);
            utils.tags.getAll.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    function onSubmit(data: TagFormData) {
        updateTag.mutate({
            id: tag.id,
            ...data,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Tag</DialogTitle>
                    <DialogDescription>
                        Make changes to the tag here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Work, Vacation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="context">Context</SelectItem>
                                            <SelectItem value="frequency">Frequency</SelectItem>
                                            <SelectItem value="emotion">Emotion</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={updateTag.isPending}>
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
