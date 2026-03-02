'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback } from 'react';

export default function TiptapEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: 'Write your blog post here...' }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-purple max-w-none focus:outline-none min-h-[400px] p-4 bg-white/5 rounded-b-xl border-x border-b border-white/10',
            },
        },
        immediatelyRender: false,
    });

    const addImage = useCallback(() => {
        const url = window.prompt('URL of the image:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    const MenuButton = ({ isActive, onClick, children }) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white/70'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 p-2 bg-white/10 rounded-t-xl border border-white/10">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                >
                    Bold
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                >
                    Italic
                </MenuButton>
                <div className="w-px h-6 bg-white/10 my-auto mx-1" />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                >
                    H2
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                >
                    H3
                </MenuButton>
                <div className="w-px h-6 bg-white/10 my-auto mx-1" />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                >
                    Bullet List
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                >
                    Ordered List
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                >
                    Quote
                </MenuButton>
                <div className="w-px h-6 bg-white/10 my-auto mx-1" />
                <MenuButton onClick={setLink} isActive={editor.isActive('link')}>
                    Link
                </MenuButton>
                <MenuButton onClick={addImage} isActive={false}>
                    Image
                </MenuButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
