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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
    start: z.string().min(1, { message: "Start date is required" }),
    end: z.string().nullable().optional(),
    label: z.string().min(1, { message: "Label is required" }),
    category: z.string(),
});

interface TimelineFormProps {
    onSubmit: (data: TimelineItem) => void;
}

export function TimelineForm({ onSubmit }: TimelineFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start: "",
            end: "",
            label: "",
            category: "default",
        },
    });

    function handleSubmit(values: z.infer<typeof formSchema>) {
        onSubmit({
            start: values.start,
            end: values.end || null, // Convert empty string to null
            label: values.label,
            category: values.category,
        });
        form.reset({
            start: "",
            end: "",
            label: "",
            category: "default"
        });
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg bg-card/50 backdrop-blur-sm border-muted">
            <CardHeader>
                <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                        <Button type="submit" className="w-full md:w-auto">Add Timeline Event</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
