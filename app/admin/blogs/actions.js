'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function uploadToBackend(fileOrBuffer, filename = null) {
    const cookieStore = await cookies();
    const apiUrl = cookieStore.get('cms_api_url')?.value;
    const apiToken = cookieStore.get('cms_api_token')?.value;

    if (!apiUrl || !apiToken) return null;

    const formData = new FormData();
    if (fileOrBuffer instanceof Blob || fileOrBuffer instanceof File) {
        formData.append('file', fileOrBuffer);
    } else {
        // Handle Buffer (scraped images)
        const blob = new Blob([fileOrBuffer]);
        formData.append('file', blob, filename || 'scraped.webp');
    }

    try {
        const res = await fetch(`${apiUrl}/cms-upload`, {
            method: 'POST',
            headers: { 'X-CMS-MASTER-TOKEN': apiToken },
            body: formData
        });
        const data = await res.json();
        return data.success ? data.url : null;
    } catch (e) {
        console.error('Remote upload failed:', e);
        return null;
    }
}

export async function saveBlog(id, formData) {
    const title = formData.get('title');
    const slug = formData.get('slugs');
    const category_id = formData.get('category_id');
    const subcategory_id = formData.get('subcategory_id') || 0;
    const status = formData.get('status');
    const detail = formData.get('detail');

    // Extracted software metadata
    const soft_image = formData.get('soft_image') || '';
    const software_name = formData.get('software_name') || '';
    const software_version = formData.get('software_version') || '';
    const software_description = formData.get('software_description') || '';
    const publisher_name = formData.get('publisher_name') || '';
    const application_category = formData.get('application_category') || '';
    const date_published = formData.get('date_published') || '';
    const date_modified = formData.get('date_modified') || '';
    const operating_system = formData.get('operating_system') || '';
    const price = formData.get('price') || '';
    const review_count = formData.get('review_count') || '';
    const rating_value = formData.get('rating_value') || '';
    const blogkey = formData.get('blogkey') || '';
    const downloadable_link = formData.get('downloadable_link') || '';
    const licence = formData.get('licence') || '';
    const file_size = formData.get('file_size') || '';

    // Advanced Phase 13 Fields
    const virustotal_link = formData.get('virustotal_link') || '';
    const zip_password = formData.get('zip_password') || '';
    const system_requirements = formData.get('system_requirements') || '';
    const changelog = formData.get('changelog') || '';
    const download_mirrors = formData.get('download_mirrors') || '';

    let blogId = id;
    let mainImagePath = null;

    // Process main image file upload (Remote Proxy)
    const mainImageFile = formData.get('image');
    if (mainImageFile && mainImageFile.size > 0 && typeof mainImageFile.arrayBuffer === 'function') {
        const remoteUrl = await uploadToBackend(mainImageFile);
        if (remoteUrl) mainImagePath = remoteUrl;
    }

    if (id) {
        if (mainImagePath) {
            await query(
                `UPDATE blogs SET 
            title = ?, slugs = ?, category_id = ?, subcategory_id = ?, 
            status = ?, detail = ?, soft_image = ?, image = ?, software_name = ?,
            software_version = ?, software_description = ?, publisher_name = ?, application_category = ?,
            date_published = ?, date_modified = ?, operating_system = ?, price = ?,
            review_count = ?, rating_value = ?, blogkey = ?, downloadable_link = ?,
            licence = ?, file_size = ?, virustotal_link = ?, zip_password = ?, 
            system_requirements = ?, changelog = ?, download_mirrors = ?
           WHERE id = ?`,
                [title, slug, category_id, subcategory_id, status, detail, soft_image, mainImagePath, software_name,
                    software_version, software_description, publisher_name, application_category,
                    date_published, date_modified, operating_system, price,
                    review_count, rating_value, blogkey, downloadable_link,
                    licence, file_size, virustotal_link, zip_password, system_requirements, changelog, download_mirrors, id]
            );
        } else {
            await query(
                `UPDATE blogs SET 
            title = ?, slugs = ?, category_id = ?, subcategory_id = ?, 
            status = ?, detail = ?, soft_image = ?, software_name = ?,
            software_version = ?, software_description = ?, publisher_name = ?, application_category = ?,
            date_published = ?, date_modified = ?, operating_system = ?, price = ?,
            review_count = ?, rating_value = ?, blogkey = ?, downloadable_link = ?,
            licence = ?, file_size = ?, virustotal_link = ?, zip_password = ?, 
            system_requirements = ?, changelog = ?, download_mirrors = ?
           WHERE id = ?`,
                [title, slug, category_id, subcategory_id, status, detail, soft_image, software_name,
                    software_version, software_description, publisher_name, application_category,
                    date_published, date_modified, operating_system, price,
                    review_count, rating_value, blogkey, downloadable_link,
                    licence, file_size, virustotal_link, zip_password, system_requirements, changelog, download_mirrors, id]
            );
        }
    } else {
        const insertRes = await query(
            `INSERT INTO blogs 
        (title, slugs, category_id, subcategory_id, status, detail, soft_image, image, software_name,
         software_version, software_description, publisher_name, application_category,
         date_published, date_modified, operating_system, price, review_count, rating_value,
         blogkey, downloadable_link, licence, file_size, virustotal_link, zip_password, system_requirements, changelog, download_mirrors, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [title, slug, category_id, subcategory_id, status, detail, soft_image, mainImagePath, software_name,
                software_version, software_description, publisher_name, application_category,
                date_published, date_modified, operating_system, price, review_count, rating_value,
                blogkey, downloadable_link, licence, file_size, virustotal_link, zip_password, system_requirements, changelog, download_mirrors]
        );
        blogId = insertRes.insertId;
    }

    // Process file uploads (Slider Images - Remote Proxy)
    const sliderFiles = formData.getAll('images[]');
    const scrapedImages = formData.getAll('scraped_images[]');
    const deletedImages = formData.getAll('deleted_images[]');

    if (deletedImages && deletedImages.length > 0) {
        for (const imageId of deletedImages) {
            await query(`DELETE FROM blog_images WHERE id = ? AND blog_id = ?`, [imageId, blogId]);
        }
    }

    if (sliderFiles && sliderFiles.length > 0) {
        for (const file of sliderFiles) {
            if (file && file.size > 0 && typeof file.arrayBuffer === 'function') {
                const remoteUrl = await uploadToBackend(file);
                if (remoteUrl) {
                    await query(
                        `INSERT INTO blog_images (blog_id, image_path, created_at) VALUES (?, ?, NOW())`,
                        [blogId, remoteUrl]
                    );
                }
            }
        }
    }

    // Process scraped image URLs (Remote download and re-upload Bridge)
    if (scrapedImages && scrapedImages.length > 0) {
        for (const imageUrl of scrapedImages) {
            if (imageUrl && imageUrl.startsWith('http')) {
                try {
                    const res = await fetch(imageUrl);
                    if (res.ok) {
                        const buffer = await res.arrayBuffer();
                        const remoteUrl = await uploadToBackend(buffer, `scraped_${Date.now()}.webp`);
                        if (remoteUrl) {
                            await query(
                                `INSERT INTO blog_images (blog_id, image_path, created_at) VALUES (?, ?, NOW())`,
                                [blogId, remoteUrl]
                            );
                        }
                    }
                } catch (e) {
                    console.error('Failed to bridge scraped image:', imageUrl, e);
                }
            }
        }
    }

    // Handle Translations
    try {
        const langs = await query("SELECT locale FROM languages WHERE status = 'Active' AND locale != 'en'");
        for (const lang of langs) {
            const l = lang.locale;
            const transData = [
                { col: 'title', val: formData.get(`title_${l}`) },
                { col: 'software_name', val: formData.get(`software_name_${l}`) },
                { col: 'software_description', val: formData.get(`software_description_${l}`) },
                { col: 'detail', val: formData.get(`detail_${l}`) },
                { col: 'system_requirements', val: formData.get(`system_requirements_${l}`) },
                { col: 'changelog', val: formData.get(`changelog_${l}`) }
            ];

            for (const t of transData) {
                if (t.val) {
                    await query(
                        `INSERT INTO translations (table_name, column_name, row_id, locale, value) 
                         VALUES (?, ?, ?, ?, ?) 
                         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`,
                        ['blogs', t.col, blogId, l, t.val]
                    );
                }
            }
        }
    } catch (e) {
        console.error('Failed to save blog translations:', e);
    }

    revalidatePath('/admin/blogs');
    revalidatePath('/');
    redirect('/admin/blogs');
}
