import { useEffect } from "react";
import { Button, Paper, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

export type CourseFormValues = {
    title: string;
    description: string;
};

type Props = {
    initial?: Partial<CourseFormValues>;
    loading?: boolean;
    submitLabel?: string;
    onSubmit: (values: CourseFormValues) => Promise<void> | void;
};

export default function CourseForm({
                                       initial,
                                       loading,
                                       submitLabel = "Сохранить",
                                       onSubmit,
                                   }: Props) {
    const form = useForm<CourseFormValues>({
        initialValues: {
            title: initial?.title ?? "",
            description: initial?.description ?? "",
        },
        validate: {
            title: (v) =>
                v.trim().length < 3 ? "Название курса слишком короткое" : null,
            description: (v) =>
                v.trim().length < 10 ? "Описание курса слишком короткое" : null,
        },
    });

    // 🔥 когда приходят initial из EditCoursePage – закидываем их в форму
    useEffect(() => {
        if (!initial) return;

        const next = {
            title: initial.title ?? "",
            description: initial.description ?? "",
        };

        form.setValues(next);
        // чтобы форма не считалась "изменённой" сразу после загрузки
        form.resetDirty(next);
    }, [initial]);

    const handleSubmit = (values: CourseFormValues) => {
        onSubmit({
            title: values.title.trim(),
            description: values.description.trim(),
        });
    };

    return (
        <Paper withBorder radius="lg" p="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Название курса"
                        placeholder="Java Backend для начинающих"
                        disabled={loading}
                        {...form.getInputProps("title")}
                    />

                    <TextInput
                        label="Краткое описание"
                        placeholder="О чём этот курс?"
                        disabled={loading}
                        {...form.getInputProps("description")}
                    />

                    <Button type="submit" loading={loading} w="fit-content">
                        {submitLabel}
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
}
