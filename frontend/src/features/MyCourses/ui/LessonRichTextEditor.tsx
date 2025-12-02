// src/features/MyCourses/ui/LessonRichTextEditor.tsx

import { useEffect } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

type Props = {
    value: string;
    onChange: (next: string) => void;
};

export default function LessonRichTextEditor({ value, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: true,
            }),
            Highlight,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: value || "<p>Напишите текст урока...</p>",
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    // когда меняется value снаружи (при открытии другого урока) — обновляем редактор
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "<p>Напишите текст урока...</p>", false);
        }
    }, [value, editor]);

    return (
        <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar sticky stickyOffset={0}>
                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.Highlight />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignRight />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
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
