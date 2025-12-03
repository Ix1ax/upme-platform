// src/features/course/ui/LessonContentRenderer.tsx

import React from "react";
import { Image, Stack, Text, Paper } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import "@mantine/code-highlight/styles.css";

import type { LessonResponse } from "@/features/course/api/CourseLearningService";

type Props = {
    lesson: LessonResponse | null;
};

// Типы блоков, которые мы ожидаем от бэка
type TextBlock = {
    type: "text";
    html?: string;
};

type ImageBlock = {
    type: "image";
    url: string;
    alt?: string;
};

type VideoBlock = {
    type: "video";
    url: string;
    duration?: number;
};

type CodeBlock = {
    type: "code";
    language?: string;
    content?: string;
};

type AnyBlock = TextBlock | ImageBlock | VideoBlock | CodeBlock | Record<string, unknown>;

function looksLikeHtml(value: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(value);
}

const LessonContentRenderer: React.FC<Props> = ({ lesson }) => {
    if (!lesson) {
        return (
            <Text c="dimmed" size="sm">
                Выберите урок слева.
            </Text>
        );
    }

    const content = lesson.content;

    if (content == null) {
        return (
            <Text c="dimmed" size="sm">
                Для этого урока пока нет контента.
            </Text>
        );
    }

    // ----- СЛУЧАЙ 1. Контент — просто строка -----
    if (typeof content === "string") {
        if (looksLikeHtml(content)) {
            return (
                <div
                    style={{ fontSize: 14, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            );
        }

        return (
            <Text style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
                {content}
            </Text>
        );
    }

    // ----- СЛУЧАЙ 2. Объект с type / value / html -----
    if (typeof content === "object") {
        const obj: unknown = content;

        // { type: "markdown", value: "<p>...</p>" } или { type: "html", value: "..." }
        if (
            typeof obj.value === "string" &&
            (obj.type === "markdown" || obj.type === "html")
        ) {
            const value: string = obj.value;
            if (looksLikeHtml(value)) {
                return (
                    <div
                        style={{ fontSize: 14, lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: value }}
                    />
                );
            }
            return (
                <Text style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
                    {value}
                </Text>
            );
        }

        // { html: "<p>...</p>" }
        if (typeof obj.html === "string") {
            return (
                <div
                    style={{ fontSize: 14, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: obj.html }}
                />
            );
        }

        // ----- СЛУЧАЙ 3. Структура с blocks -----
        const blocks: AnyBlock[] | null = Array.isArray(obj.blocks)
            ? (obj.blocks as AnyBlock[])
            : null;

        if (blocks && blocks.length > 0) {
            return (
                <Stack gap="sm">
                    {blocks.map((block, index) => {
                        const key = `${(block as any).type ?? "block"}-${index}`;

                        switch ((block as any).type) {
                            case "text": {
                                const html = (block as TextBlock).html ?? "";
                                return (
                                    <div
                                        key={key}
                                        style={{ fontSize: 14, lineHeight: 1.6 }}
                                        dangerouslySetInnerHTML={{ __html: html }}
                                    />
                                );
                            }

                            case "image": {
                                const b = block as ImageBlock;
                                return (
                                    <Paper key={key} withBorder radius="md" p="xs">
                                        <Image
                                            src={b.url}
                                            alt={b.alt ?? ""}
                                            radius="md"
                                            fit="contain"
                                            mah={320}
                                        />
                                        {b.alt && (
                                            <Text size="xs" c="dimmed" mt={4}>
                                                {b.alt}
                                            </Text>
                                        )}
                                    </Paper>
                                );
                            }

                            case "video": {
                                const b = block as VideoBlock;
                                return (
                                    <Stack key={key} gap={4}>
                                        <video
                                            controls
                                            style={{
                                                maxWidth: "100%",
                                                borderRadius: 12,
                                                outline: "none",
                                            }}
                                        >
                                            <source src={b.url} />
                                            Ваш браузер не поддерживает video-тег.
                                        </video>
                                        {b.duration && (
                                            <Text size="xs" c="dimmed">
                                                Длительность: ~{Math.round(b.duration / 60)} мин
                                            </Text>
                                        )}
                                    </Stack>
                                );
                            }

                            case "code": {
                                const b = block as CodeBlock;
                                return (
                                    <CodeHighlight
                                        key={key}
                                        language={b.language ?? "tsx"}
                                        code={b.content ?? ""}
                                    />
                                );
                            }

                            default:
                                return (
                                    <pre
                                        key={key}
                                        style={{
                                            fontSize: 12,
                                            background: "#f9fafb",
                                            padding: 8,
                                            borderRadius: 8,
                                            overflowX: "auto",
                                        }}
                                    >
                    {JSON.stringify(block, null, 2)}
                  </pre>
                                );
                        }
                    })}
                </Stack>
            );
        }

        // ----- СЛУЧАЙ 4. Непонятный объект — просто покажем JSON -----
        return (
            <pre
                style={{
                    fontSize: 12,
                    background: "#f9fafb",
                    padding: 8,
                    borderRadius: 8,
                    overflowX: "auto",
                }}
            >
        {JSON.stringify(content, null, 2)}
      </pre>
        );
    }

    // На всякий случай — сюда вряд ли попадём
    return (
        <Text size="sm" c="dimmed">
            Невозможно отобразить контент урока.
        </Text>
    );
};

export default LessonContentRenderer;
