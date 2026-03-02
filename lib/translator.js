/**
 * Zero-dependency Translator Utility
 * Uses Google Translate's public API (client=gtx)
 */

export async function translate(text, targetLocale, sourceLocale = 'en') {
    if (!text || !targetLocale || targetLocale === sourceLocale) return text;

    // Split text into chunks that don't break HTML tags
    const CHUNK_SIZE = 2000;
    const parts = text.split(/(?<=>)/); // Split after each '>'
    const chunks = [];
    let currentChunk = "";

    for (const part of parts) {
        if ((currentChunk.length + part.length) > CHUNK_SIZE && currentChunk !== "") {
            chunks.push(currentChunk);
            currentChunk = part;
        } else {
            currentChunk += part;
        }
    }
    if (currentChunk) chunks.push(currentChunk);

    try {
        const translatedChunks = await Promise.all(chunks.map(async (chunk) => {
            // If the chunk is purely a tag or whitespace, don't translate
            if (!/[a-zA-Z]/.test(chunk.replace(/<[^>]*>/g, ''))) return chunk;

            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLocale}&tl=${targetLocale}&dt=t&q=${encodeURIComponent(chunk)}`;
            const response = await fetch(url);
            if (!response.ok) return chunk;

            const data = await response.json();
            if (data && data[0]) {
                return data[0].map(item => item[0]).join('');
            }
            return chunk;
        }));

        return translatedChunks.join('');
    } catch (error) {
        console.error(`Translation failed for locale ${targetLocale}:`, error);
        return text;
    }
}
