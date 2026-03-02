'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleLanguageStatus(id, currentStatus) {
    try {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        await query('UPDATE languages SET status = ? WHERE id = ?', [newStatus, id]);
        revalidatePath('/admin/languages');
    } catch (e) {
        console.error('Failed to toggle language:', e);
        throw new Error('Failed to toggle language.');
    }
}
