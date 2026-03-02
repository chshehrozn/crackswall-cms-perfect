'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveCategory(id, formData) {
    const title = formData.get('title');
    const seo_title = formData.get('seo_title') || '';
    const slug = formData.get('slug') || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const description = formData.get('description') || '';
    const category_id = parseInt(formData.get('category_id') || '0', 10);
    const status = formData.get('status') || 'Active';
    const icon_code = formData.get('icon_code') || '';

    const is_type = category_id === 0 ? 'category' : 'subcategory';

    try {
        let categoryId = id;
        if (id) {
            // Update existing
            await query(
                `UPDATE slip_categories SET 
                    title = ?, seo_title = ?, slug = ?, description = ?, 
                    category_id = ?, status = ?, icon_code = ?, is_type = ?,
                    updated_at = NOW()
                 WHERE id = ?`,
                [title, seo_title, slug, description, category_id, status, icon_code, is_type, id]
            );
        } else {
            // Insert new
            const result = await query(
                `INSERT INTO slip_categories 
                    (title, seo_title, slug, description, category_id, status, icon_code, is_type, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [title, seo_title, slug, description, category_id, status, icon_code, is_type]
            );
            categoryId = result.insertId;
        }

        // Handle Translations for other languages
        const langs = await query("SELECT locale FROM languages WHERE status = 'Active' AND locale != 'en'");
        for (const lang of langs) {
            const l = lang.locale;
            const transData = [
                { col: 'title', val: formData.get(`title_${l}`) },
                { col: 'seo_title', val: formData.get(`seo_title_${l}`) },
                { col: 'description', val: formData.get(`description_${l}`) }
            ];

            for (const t of transData) {
                if (t.val) {
                    await query(
                        `INSERT INTO translations (table_name, column_name, row_id, locale, value) 
                         VALUES (?, ?, ?, ?, ?) 
                         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`,
                        ['slip_categories', t.col, categoryId, l, t.val]
                    );
                }
            }
        }

    } catch (e) {
        console.error('Failed to save category:', e);
        throw new Error('Failed to save category');
    }

    revalidatePath('/admin/categories');
    redirect('/admin/categories');
}

export async function deleteCategory(id) {
    try {
        await query('DELETE FROM slip_categories WHERE id = ?', [id]);
        revalidatePath('/admin/categories');
    } catch (e) {
        console.error(e);
        throw new Error('Failed to delete category');
    }
}
