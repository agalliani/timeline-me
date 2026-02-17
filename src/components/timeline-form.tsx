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
import { Textarea } from "@/components/ui/textarea";
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
    description: z.string().optional(),
});

interface TimelineFormProps {
    onSubmit: (data: TimelineItem) => void;
    defaultValues?: TimelineItem;
    submitLabel?: string;
    onDelete?: () => void;
}

export function TimelineForm({ onSubmit, defaultValues, submitLabel = "Add Timeline Event", onDelete }: TimelineFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start: defaultValues?.start || "",
            end: defaultValues?.end || "",
            label: defaultValues?.label || "",
            category: defaultValues?.category || "default",
            description: defaultValues?.description || "",
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
            description: values.description,
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
                                        <SelectItem value="red">Red</SelectItem>
                                        <SelectItem value="orange">Orange</SelectItem>
                                        <SelectItem value="amber">Amber</SelectItem>
                                        <SelectItem value="yellow">Yellow</SelectItem>
                                        <SelectItem value="lime">Lime</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="emerald">Emerald</SelectItem>
                                        <SelectItem value="teal">Teal</SelectItem>
                                        <SelectItem value="cyan">Cyan</SelectItem>
                                        <SelectItem value="sky">Sky</SelectItem>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="indigo">Indigo</SelectItem>
                                        <SelectItem value="violet">Violet</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                        <SelectItem value="fuchsia">Fuchsia</SelectItem>
                                        <SelectItem value="pink">Pink</SelectItem>
                                        <SelectItem value="rose">Rose</SelectItem>
                                        <SelectItem value="slate">Slate</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Details about this event..." className="resize-y" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between items-center">
                    {onDelete && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onDelete}
                        >
                            Delete Event
                        </Button>
                    )}
                    <div className="flex-1 flex justify-end">
                        <Button type="submit">{submitLabel}</Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
