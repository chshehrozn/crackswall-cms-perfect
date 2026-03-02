'use client';

import { Editor } from '@tinymce/tinymce-react';

export default function TinyMCEEditor({ content, onChange }) {
    return (
        <div className="rounded-xl overflow-hidden border border-white/20">
            <Editor
                apiKey="6xks1430ljsw5zxmf38wmpa3wicrigesbj5jiesv0pwngdrf" // The exact key from the Laravel backend
                value={content}
                onEditorChange={(newContent) => onChange(newContent)}
                init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'linkchecker'
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                    content_style: `
                        body { 
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                            font-size: 15px; 
                            background-color: #0f0a20; 
                            color: #e2e8f0; 
                        }
                        a { color: #a855f7; }
                    `,
                    skin: 'oxide-dark',
                    content_css: 'dark'
                }}
            />
        </div>
    );
}
