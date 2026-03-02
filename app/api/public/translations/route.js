import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { translate } from "@/lib/translator";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const locale = url.searchParams.get('locale');
        const reqTable = url.searchParams.get('table');
        const reqId = url.searchParams.get('id');

        if (!locale || locale === 'en') {
            return NextResponse.json({ status: false, message: "Locale is required", data: [] });
        }

        // 1. Fetch current translations for this locale
        const finalTranslations = await query(
            "SELECT table_name, column_name, row_id, value FROM translations WHERE locale = ?",
            [locale]
        );

        const transMap = new Set(finalTranslations.map(t => `${t.table_name}_${t.column_name}_${t.row_id}`));

        // 2. Prioritize translating the requested specific item IF it's missing translations
        if (reqTable && reqId) {
            console.log(`Priority sync requested for ${reqTable} ID ${reqId}`);
            let item = null;
            let transCols = [];

            if (reqTable === 'blogs') {
                const results = await query("SELECT title, seo_title, software_name, software_description, detail, system_requirements, changelog FROM blogs WHERE id = ?", [reqId]);
                item = results[0];
                transCols = ['title', 'seo_title', 'software_name', 'software_description', 'detail', 'system_requirements', 'changelog'];
            } else if (reqTable === 'slip_categories') {
                const results = await query("SELECT title, description, seo_title FROM slip_categories WHERE id = ?", [reqId]);
                item = results[0];
                transCols = ['title', 'description', 'seo_title'];
            } else if (reqTable === 'pages') {
                const results = await query("SELECT title, content, seo_title FROM pages WHERE id = ?", [reqId]);
                item = results[0];
                transCols = ['title', 'content', 'seo_title'];
            }

            if (item) {
                for (const col of transCols) {
                    const key = `${reqTable}_${col}_${reqId}`;
                    if (item[col] && item[col].trim() !== "" && !transMap.has(key)) {
                        try {
                            console.log(`Translating ${key}...`);
                            const translatedValue = await translate(item[col], locale);
                            console.log(`Success: ${key}`);
                            if (translatedValue && translatedValue !== item[col]) {
                                await query(
                                    `INSERT INTO translations (table_name, column_name, row_id, locale, value) 
                                     VALUES (?, ?, ?, ?, ?) 
                                     ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`,
                                    [reqTable, col, reqId, locale, translatedValue]
                                );
                            }
                        } catch (e) {
                            console.error(`Priority translation failed for ${key}:`, e.message);
                        }
                    }
                }
            }
        }

        // 3. Lazy Sync: Clean up/Handle other missing translations (limit 15)
        const activeCategories = await query("SELECT id, title, description, seo_title FROM slip_categories WHERE status = 'Active'");
        const activeBlogs = await query("SELECT id, title, seo_title, software_name, software_description, detail, system_requirements, changelog FROM blogs WHERE status = 'Active' ORDER BY id DESC LIMIT 20");
        const activePages = await query("SELECT id, title, content, seo_title FROM pages WHERE status = 'Active'");

        const queue = [];

        for (const cat of activeCategories) {
            ['title', 'description', 'seo_title'].forEach(col => {
                if (cat[col] && cat[col].trim() !== "" && !transMap.has(`slip_categories_${col}_${cat.id}`)) {
                    queue.push({ table: 'slip_categories', col, id: cat.id, text: cat[col] });
                }
            });
        }
        for (const blog of activeBlogs) {
            ['title', 'seo_title', 'software_name', 'software_description', 'detail', 'system_requirements', 'changelog'].forEach(col => {
                if (blog[col] && blog[col].trim() !== "" && !transMap.has(`blogs_${col}_${blog.id}`)) {
                    queue.push({ table: 'blogs', col, id: blog.id, text: blog[col] });
                }
            });
        }
        for (const page of activePages) {
            ['title', 'content', 'seo_title'].forEach(col => {
                if (page[col] && page[col].trim() !== "" && !transMap.has(`pages_${col}_${page.id}`)) {
                    queue.push({ table: 'pages', col, id: page.id, text: page[col] });
                }
            });
        }

        // Parallel processing of small batches to speed up sync
        const toProcess = queue.slice(0, 15);
        await Promise.all(toProcess.map(async (item) => {
            try {
                const translatedValue = await translate(item.text, locale);
                if (translatedValue && translatedValue !== item.text) {
                    await query(
                        `INSERT INTO translations (table_name, column_name, row_id, locale, value) 
                         VALUES (?, ?, ?, ?, ?) 
                         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`,
                        [item.table, item.col, item.id, locale, translatedValue]
                    );
                }
            } catch (e) {
                console.error(`Lazy sync failed for ${item.table}_${item.col}_${item.id}:`, e.message);
            }
        }));

        // Return the UPDATED list
        const updatedTranslations = await query(
            "SELECT table_name, column_name, row_id, value FROM translations WHERE locale = ?",
            [locale]
        );

        return NextResponse.json({
            status: true,
            message: "Translations synced successfully",
            data: updatedTranslations
        });
    } catch (error) {
        console.error("Fetch Translations API Error:", error);
        return NextResponse.json({ status: false, message: error.message, data: [] }, { status: 500 });
    }
}
