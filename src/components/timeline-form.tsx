"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TimelineItem } from "@/types/timeline";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
    start: z.string().min(1, { message: "Start date is required" }),
    end: z.string().nullable().optional(),
    label: z.string().min(1, { message: "Label is required" }),
    category: z.string(),
});

interface TimelineFormProps {
    onSubmit: (data: TimelineItem) => void;
    defaultValues?: TimelineItem;
    submitLabel?: string;
}

export function TimelineForm({ onSubmit, defaultValues, submitLabel = "Add Timeline Event" }: TimelineFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start: defaultValues?.start || "",
            end: defaultValues?.end || "",
            label: defaultValues?.label || "",
            category: defaultValues?.category || "default",
        },
    });

    // Reset form when defaultValues change (important for modal reuse)
    // We can use a key on the component or useEffect, but key is cleaner in parent.
    // Actually, let's add a useEffect to be safe if parent doesn't key.
    // ... import useEffect ... 

    function handleSubmit(values: z.infer<typeof formSchema>) {
        onSubmit({
            start: values.start,
            end: values.end || null,
            label: values.label,
            category: values.category,
        });
        // Only reset if NOT editing (no defaultValues provided) or if explicitly desired.
        // Usually in a modal, we close the modal, so reset might not matter, 
        // but if we reuse the form for "Add", we want it clear.
        if (!defaultValues) {
            form.reset({
                start: "",
                end: "",
                label: "",
                category: "default"
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start (YYYY-MM)</FormLabel>
                                <FormControl>
                                    <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End (YYYY-MM)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="month"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                    <Input placeholder="Job, Event, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="default">Default (Blue)</SelectItem>
                                        <SelectItem value="lorem">Green</SelectItem>
                                        <SelectItem value="ipsum">Cyan</SelectItem>
                                        <SelectItem value="dolor">Yellow</SelectItem>
                                        <SelectItem value="sit">Purple</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit">{submitLabel}</Button>
                </div>
            </form>
        </Form>
    );
}
