'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function savePage(id, formData) {
    const title = formData.get('title');
    const slug = formData.get('slug');
    const status = formData.get('status');
    const content = formData.get('content');

    if (id) {
        await query(
            `UPDATE pages SET title = ?, slug = ?, status = ?, content = ? WHERE id = ?`,
            [title, slug, status, content, id]
        );
    } else {
        await query(
            `INSERT INTO pages (title, slug, status, content) VALUES (?, ?, ?, ?)`,
            [title, slug, status, content]
        );
    }

    revalidatePath('/admin/pages');
    revalidatePath('/');
    redirect('/admin/pages');
}
