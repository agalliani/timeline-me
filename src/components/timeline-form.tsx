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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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

const COLOR_OPTIONS = [
    { value: "slate", class: "bg-zinc-500" },
    { value: "red", class: "bg-red-500" },
    { value: "orange", class: "bg-orange-500" },
    { value: "amber", class: "bg-amber-500" },
    { value: "yellow", class: "bg-yellow-500" },
    { value: "lime", class: "bg-lime-500" },
    { value: "green", class: "bg-green-500" },
    { value: "emerald", class: "bg-emerald-500" },
    { value: "teal", class: "bg-teal-500" },
    { value: "cyan", class: "bg-cyan-500" },
    { value: "sky", class: "bg-sky-500" },
    { value: "blue", class: "bg-blue-500" },
    { value: "indigo", class: "bg-indigo-500" },
    { value: "violet", class: "bg-violet-500" },
    { value: "purple", class: "bg-purple-500" },
    { value: "fuchsia", class: "bg-fuchsia-500" },
    { value: "pink", class: "bg-pink-500" },
    { value: "rose", class: "bg-rose-500" },
];

export function TimelineForm({ onSubmit, defaultValues, submitLabel = "Add Timeline Event", onDelete }: TimelineFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start: defaultValues?.start || "",
            end: defaultValues?.end || "",
            label: defaultValues?.label || "",
            category: defaultValues?.category || "blue", // Default to blue instead of "default"
            description: defaultValues?.description || "",
        },
    });

    function handleSubmit(values: z.infer<typeof formSchema>) {
        onSubmit({
            start: values.start,
            end: values.end || null,
            label: values.label,
            category: values.category,
            description: values.description,
        });

        if (!defaultValues) {
            form.reset({
                start: "",
                end: "",
                label: "",
                category: "blue"
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="start"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
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
                                    <FormLabel>End Date <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FormLabel>
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
                    </div>

                    <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Job Title, Project Name, etc." className="font-medium" {...field} />
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
                                <FormLabel>Color Tag</FormLabel>
                                <FormControl>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {COLOR_OPTIONS.map((color) => (
                                            <div
                                                key={color.value}
                                                className={cn(
                                                    "w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all hover:scale-110",
                                                    color.class,
                                                    field.value === color.value ? "ring-2 ring-offset-2 ring-zinc-400 scale-110" : "opacity-70 hover:opacity-100"
                                                )}
                                                onClick={() => field.onChange(color.value)}
                                                title={color.value}
                                            >
                                                {field.value === color.value && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                                            </div>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Select a color to visually categorize this event.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Add details, achievements, or tech stack..."
                                        className="resize-y min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-zinc-100 mt-6">
                    {onDelete && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0"
                            onClick={onDelete}
                        >
                            Delete
                        </Button>
                    )}
                    <div className="flex-1 flex justify-end">
                        <Button type="submit" size="default" className="px-6">
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
