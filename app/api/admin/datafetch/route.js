import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const blogkey = searchParams.get('blogkey');
        const categoryId = searchParams.get('category');

        if (!blogkey || !categoryId) {
            return NextResponse.json({ error: 'Missing blogkey or category' }, { status: 400 });
        }

        const category = await queryOne('SELECT slug FROM slip_categories WHERE id = ?', [categoryId]);
        if (!category || !category.slug) {
            return NextResponse.json({ error: 'Category not found or has no slug' }, { status: 404 });
        }

        const url = `https://filecr.com/${category.slug}/${blogkey}`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: `Failed to fetch from filecr.com (HTTP ${res.status})` }, { status: 400 });
        }

        const content = await res.text();

        // Extract JSON data from the content (matching PHP logic)
        const jsonStrMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);

        if (!jsonStrMatch || jsonStrMatch.length < 1) {
            return NextResponse.json({ error: 'Failed to extract JSON data from page' }, { status: 400 });
        }

        // Usually the relevant SoftwareApplication JSON-LD is in the document. We need to find the right one if there are multiple.
        let parsedData = null;
        for (const block of jsonStrMatch) {
            try {
                const rawJson = block.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '').trim();
                const jsonObj = JSON.parse(rawJson);
                if (jsonObj['@type'] === 'SoftwareApplication') {
                    parsedData = jsonObj;
                    break;
                } else if (Array.isArray(jsonObj)) {
                    const graphItem = jsonObj.find(item => item['@type'] === 'SoftwareApplication');
                    if (graphItem) {
                        parsedData = graphItem;
                        break;
                    }
                } else if (jsonObj['@graph']) {
                    const graphItem = jsonObj['@graph'].find(item => item['@type'] === 'SoftwareApplication');
                    if (graphItem) {
                        parsedData = graphItem;
                        break;
                    }
                }
            } catch (e) {
                // Ignore bad JSON blocks
            }
        }

        if (!parsedData) {
            // Fallback: Just try parsing the first or second one
            try {
                const fallbackBlock = (jsonStrMatch.length >= 2 ? jsonStrMatch[1] : jsonStrMatch[0]).replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
                parsedData = JSON.parse(fallbackBlock);
            } catch (e) {
                return NextResponse.json({ error: 'Failed to decode JSON data' }, { status: 400 });
            }
        }

        return NextResponse.json({
            name: parsedData?.name || 'N/A',
            version: parsedData?.softwareVersion || parsedData?.version || 'N/A',
            description: parsedData?.description || 'N/A',
            applicationCategory: parsedData?.applicationCategory || 'N/A',
            operatingSystem: parsedData?.operatingSystem || 'N/A',
            datePublished: parsedData?.datePublished || 'N/A',
            image: parsedData?.image || 'N/A',
            price: parsedData?.offers?.price || 'N/A',
            priceCurrency: parsedData?.offers?.priceCurrency || 'N/A',
            ratingValue: parsedData?.aggregateRating?.ratingValue || 'N/A',
            bestRating: parsedData?.aggregateRating?.bestRating || 'N/A',
            reviewCount: parsedData?.aggregateRating?.reviewCount || 'N/A',
            dateModified: parsedData?.dateModified || 'N/A',
            developerName: parsedData?.publisher?.name || 'N/A',
            publisher_url: parsedData?.publisher?.url || 'N/A',
            id: blogkey
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
