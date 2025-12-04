// src/features/MyCourses/ui/LessonRichTextEditor.tsx

import { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import {TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import { IconPhoto } from "@tabler/icons-react";

type Props = {
    value: string;
    onChange: (next: string) => void;

    // коллбек, который загружает файл на бэк и возвращает URL картинки
    onUploadImage: (file: File) => Promise<string>;
};

// Кастомная кнопка "вставить картинку"
function ImageControl({
                          editor,
                          onUploadImage,
                      }: {
    editor: Editor | null;
    onUploadImage: (file: File) => Promise<string>;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        if (!editor || loading) return;
        inputRef.current?.click();
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        try {
            setLoading(true);
            // грузим на /api/courses/{id}/assets
            const url = await onUploadImage(file);

            // вставляем <img src="...">
            editor
                .chain()
                .focus()
                .setImage({ src: url })
                .run();
        } catch (err) {
            console.error("Ошибка загрузки картинки", err);
            alert("Не удалось загрузить изображение");
        } finally {
            setLoading(false);
            // очищаем value, чтобы одно и то же изображение можно было выбрать повторно
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    return (
        <>
            <RichTextEditor.Control
                onClick={handleClick}
                aria-label="Вставить изображение"
                title="Вставить изображение"
                disabled={!editor || loading}
            >
                <IconPhoto size={16} />
            </RichTextEditor.Control>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleChange}
            />
        </>
    );
}

const DEFAULT_HTML = "<p>Напишите текст урока...</p>";

export default function LessonRichTextEditor({
                                                 value,
                                                 onChange,
                                                 onUploadImage,
                                             }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Highlight,
            TextStyle,
            Color.configure({ types: ["textStyle"] }),
            Link.configure({
                openOnClick: true,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Image.configure({
                inline: false,
                allowBase64: false,
            }),
        ],
        content: value || DEFAULT_HTML,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (value && value !== current) {
            editor.commands.setContent(value, false);
        }
        if (!value && current !== DEFAULT_HTML) {
            editor.commands.setContent(DEFAULT_HTML, false);
        }
    }, [value, editor]);

    return (
        <RichTextEditor
            editor={editor}
            styles={{
                root: { minHeight: 500 },
                content: { minHeight: 400, fontSize: 16 },
            }}
        >
            <RichTextEditor.Toolbar sticky stickyOffset={0}>
                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                    <RichTextEditor.Subscript />
                    <RichTextEditor.Superscript />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignJustify />
                    <RichTextEditor.AlignRight />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    {/* цвет текста */}
                    <RichTextEditor.ColorPicker
                        colors={[
                            "#25262b",
                            "#868e96",
                            "#fa5252",
                            "#e64980",
                            "#be4bdb",
                            "#7950f2",
                            "#4c6ef5",
                            "#228be6",
                            "#15aabf",
                            "#12b886",
                            "#40c057",
                            "#82c91e",
                            "#fab005",
                            "#fd7e14",
                        ]}
                    />
                    <RichTextEditor.Color />
                </RichTextEditor.ControlsGroup>

                {/* наша кастомная кнопка для загрузки картинки */}
                <RichTextEditor.ControlsGroup>
                    <ImageControl editor={editor} onUploadImage={onUploadImage} />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
        </RichTextEditor>
    );
}
