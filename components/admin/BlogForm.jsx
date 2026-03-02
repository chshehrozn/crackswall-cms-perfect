'use client';

import { useState } from 'react';
import TiptapEditor from './TiptapEditor';
import { saveBlog } from '@/app/admin/blogs/actions';
import {
    Search,
    RefreshCcw,
    Image as ImageIcon,
    Plus,
    Eye,
    Info,
    CheckCircle2,
    XCircle,
    Download,
    ShieldCheck,
    Lock,
    ListPlus,
    MonitorPlay
} from 'lucide-react';

import TranslationTabs from './TranslationTabs';

export default function BlogForm({ blog, categories, languages = [], translations = [] }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Group categories for the select dropdown (resilient to strings/numbers/nulls)
    console.log('Categories received in BlogForm:', categories?.length);
    const parentCats = (categories || []).filter(c => !c.category_id || Number(c.category_id) === 0);
    const subCats = (categories || []).filter(c => c.category_id && Number(c.category_id) !== 0);

    // Form State (allow external population)
    const [formData, setFormData] = useState(() => {
        const base = {
            title: blog?.title || '',
            slugs: blog?.slugs || '',
            category_id: blog?.category_id || '',
            subcategory_id: blog?.subcategory_id || '',
            status: blog?.status || 'Active',
            detail: blog?.detail || '',
            blogkey: blog?.blogkey || '',
            software_name: blog?.software_name || '',
            software_version: blog?.software_version || '',
            software_description: blog?.software_description || '',
            publisher_name: blog?.publisher_name || '',
            application_category: blog?.application_category || '',
            date_published: blog?.date_published || '',
            date_modified: blog?.date_modified || '',
            operating_system: blog?.operating_system || '',
            price: blog?.price || '',
            review_count: blog?.review_count || '',
            rating_value: blog?.rating_value || '',
            downloadable_link: blog?.downloadable_link || '',
            licence: blog?.licence || '',
            file_size: blog?.file_size || '',
            soft_image: blog?.soft_image || '',
            virustotal_link: blog?.virustotal_link || '',
            zip_password: blog?.zip_password || '',
            system_requirements: blog?.system_requirements || '',
            changelog: blog?.changelog || ''
        };

        // Populate with existing translations
        translations.forEach(t => {
            base[`${t.column_name}_${t.locale}`] = t.value;
        });

        return base;
    });

    const [activeTab, setActiveTab] = useState('en');

    // Helper to get translatable field name
    const f = (field) => activeTab === 'en' ? field : `${field}_${activeTab}`;

    // Mirrors Repeater State
    const [mirrors, setMirrors] = useState(() => {
        try {
            return blog?.download_mirrors ? JSON.parse(blog.download_mirrors) : [];
        } catch {
            return [];
        }
    });

    const h = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target ? e.target.value : e }));

    // Helper to format image URLs from DB (removes 'public/' if present)
    const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('public/')) return '/' + url.substring(7);
        if (!url.startsWith('/')) return '/' + url;
        return url;
    };

    // Slider Images State
    const [mainImagePreview, setMainImagePreview] = useState(formatImageUrl(blog?.image) || formatImageUrl(blog?.soft_image) || null);
    const [mainImageFile, setMainImageFile] = useState(null);

    const initialSliders = blog?.images?.length
        ? blog.images.map((img, i) => ({ id: i, image_id: img.id, file: null, preview: formatImageUrl(img.image_path) }))
        : [{ id: 0, file: null, preview: null }];

    // Slider Images State
    const [sliderImages, setSliderImages] = useState(initialSliders);
    const [deletedImageIds, setDeletedImageIds] = useState([]);

    const removeSliderImage = (id, imageId) => {
        if (imageId) {
            setDeletedImageIds(prev => [...prev, imageId]);
        }
        setSliderImages(prev => prev.filter(img => img.id !== id));
    };

    const handleFileChange = (e, isMain, id = 0) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);

        if (isMain) {
            setMainImageFile(file);
            setMainImagePreview(previewUrl);
        } else {
            setSliderImages(prev => prev.map(img =>
                img.id === id ? { ...img, file, preview: previewUrl } : img
            ));
        }
    };

    const addSliderImage = () => {
        setSliderImages(prev => [...prev, { id: prev.length, file: null, preview: null }]);
    };

    const handleGetData = async () => {
        if (!formData.blogkey || !formData.category_id) {
            alert("Please enter a Blogkey ID and target Category first.");
            return;
        }

        setFetching(true);
        try {
            const res = await fetch(`/api/admin/datafetch?blogkey=${formData.blogkey}&category=${formData.category_id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setFormData(prev => ({
                ...prev,
                software_name: data.name !== 'N/A' ? data.name : prev.software_name,
                software_version: data.version !== 'N/A' ? data.version : prev.software_version,
                software_description: data.description !== 'N/A' ? data.description : prev.software_description,
                soft_image: data.image !== 'N/A' ? data.image : prev.soft_image,
                publisher_name: data.developerName !== 'N/A' ? data.developerName : prev.publisher_name,
                application_category: data.applicationCategory !== 'N/A' ? data.applicationCategory : prev.application_category,
                operating_system: data.operatingSystem !== 'N/A' ? data.operatingSystem : prev.operating_system,
                date_published: data.datePublished !== 'N/A' ? data.datePublished : prev.date_published,
                date_modified: data.dateModified !== 'N/A' ? data.dateModified : prev.date_modified,
                price: data.price !== 'N/A' ? `${data.price} ${data.priceCurrency}` : prev.price,
                rating_value: data.ratingValue !== 'N/A' ? data.ratingValue : prev.rating_value,
                review_count: data.reviewCount !== 'N/A' ? data.reviewCount : prev.review_count,
            }));
            if (data.image !== 'N/A') setMainImagePreview(data.image);

            // Refetch / Scrape slider images if present in response
            if (data.screenshots && Array.isArray(data.screenshots) && data.screenshots.length > 0) {
                const scrapedSliders = data.screenshots.map((url, i) => ({
                    id: `scraped-${i}`,
                    file: null,
                    preview: url,
                    image_path_url: url // Store for backend submission if needed
                }));
                setSliderImages(scrapedSliders);
            }

            alert('Scraped Data successfully pulled and forms updated!');
        } catch (err) {
            console.error(err);
            alert("An error occurred executing the scrape: " + err.message);
        }
        setFetching(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const submitData = new FormData();
        Object.entries(formData).forEach(([key, val]) => submitData.append(key, val));

        if (mainImageFile) submitData.append('image', mainImageFile);

        submitData.append('download_mirrors', JSON.stringify(mirrors));

        // Add file uploads array
        sliderImages.forEach((img) => {
            if (img.file) {
                submitData.append('images[]', img.file);
            } else if (img.preview && img.preview.startsWith('http')) {
                // For scraped images that are URLs
                submitData.append('scraped_images[]', img.preview);
            }
        });

        // Send deleted image IDs
        deletedImageIds.forEach(id => submitData.append('deleted_images[]', id));

        try {
            await saveBlog(blog?.id || null, submitData);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl pb-12">

            {/* Global Language Switcher */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar sticky top-0 bg-[#0f0a25] z-50 py-4 mb-8">
                {languages.map(lang => (
                    <button
                        key={lang.locale}
                        type="button"
                        onClick={() => setActiveTab(lang.locale)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${activeTab === lang.locale
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                            }`}
                    >
                        <MonitorPlay size={14} className={activeTab === lang.locale ? 'text-white' : 'text-white/30'} />
                        {lang.name}
                    </button>
                ))}
            </div>

            {/* Scraper Tool Bar */}
            <div className="bg-purple-900/30 p-5 rounded-xl border border-purple-500/30 mb-8 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-white/90 text-sm font-medium mb-2">Category (required for URL setup)</label>
                    <select required value={formData.category_id} onChange={h('category_id')} className="w-full bg-[#1a103c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Target Category</option>
                        {parentCats.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-purple-200 text-sm font-medium mb-2">Blogkey / Software ID</label>
                    <input value={formData.blogkey} onChange={h('blogkey')} placeholder="e.g. adobe-photoshop" className="w-full bg-black/30 border border-purple-500/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <button type="button" onClick={handleGetData} disabled={fetching} className="h-[46px] px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2 shrink-0 shadow-lg shadow-purple-600/20">
                    {fetching ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} />}
                    {fetching ? 'Fetching...' : 'Get Data (Auto-fill)'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-white/70 text-sm mb-2 uppercase tracking-tight font-semibold flex items-center gap-2">
                        {activeTab} Blog Title {activeTab === 'en' && <span className="text-red-400">*</span>}
                    </label>
                    <input
                        required={activeTab === 'en'}
                        value={formData[f('title')] || ''}
                        onChange={h(f('title'))}
                        placeholder={`Enter ${activeTab} title...`}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition"
                    />
                </div>
                <div>
                    <label className="block text-white/70 text-sm mb-2">URL Slug * (Global / Permanent Link)</label>
                    <input required value={formData.slugs} onChange={h('slugs')} placeholder="e.g. adobe-photoshop-2025" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-white/70 text-sm mb-2">Subcategory</label>
                    <select value={formData.subcategory_id} onChange={h('subcategory_id')} className="w-full bg-[#1a103c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none">
                        <option value="">None</option>
                        {subCats.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-white/70 text-sm mb-2">Status</label>
                    <select value={formData.status} onChange={h('status')} className="w-full bg-[#1a103c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Custom File Upload Component that the User Requested (Replaces just text inputs) */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-medium mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                    <ImageIcon size={18} className="text-purple-400" />
                    Upload Images (Preview features)
                </h3>

                <div className="mb-6">
                    <label className="block text-white/70 text-sm mb-2">Main Image</label>
                    <div className="flex gap-4 items-start">
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, true)} className="w-full text-white/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30" />
                        {mainImagePreview && (
                            <img src={mainImagePreview} alt="Main Preview" className="w-32 h-auto rounded-lg border border-white/10 object-cover" />
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-white/70 text-sm mb-4">Slider Upload Images</label>
                    <div className="space-y-4">
                        {sliderImages.map((img) => (
                            <div key={img.id} className="relative group bg-black/20 p-4 rounded-xl border border-white/5">
                                <button type="button" onClick={() => removeSliderImage(img.id, img.image_id)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg z-10">
                                    <XCircle size={16} />
                                </button>
                                <div className="flex gap-4 items-start">
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, false, img.id)} className="w-full mt-1 text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white/70 hover:file:bg-white/20" />
                                    {img.preview && (
                                        <img src={img.preview} alt="Slider Preview" className="w-24 h-24 rounded-lg object-cover border border-white/10" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addSliderImage} className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-sm font-medium rounded-lg transition flex items-center gap-2">
                        <Plus size={16} /> Add New Image
                    </button>
                </div>
            </div>

            {/* Advanced & Trust Features */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-6">
                <h3 className="text-white font-medium pb-2 border-b border-white/10 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    Advanced Security & Trust (FileCR Parity)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-white/70 text-sm mb-2 flex items-center gap-2"><ShieldCheck size={14} /> VirusTotal Scan Link</label>
                        <input value={formData.virustotal_link} onChange={h('virustotal_link')} placeholder="https://www.virustotal.com/gui/file/..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
                        <p className="text-xs text-white/40 mt-1">Leave blank if no scan exists. Will display a green "100% Clean" badge if provided.</p>
                    </div>
                    <div>
                        <label className="block text-white/70 text-sm mb-2 flex items-center gap-2"><Lock size={14} /> Zip Password</label>
                        <input value={formData.zip_password} onChange={h('zip_password')} placeholder="e.g. crackswall.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500" />
                        <p className="text-xs text-white/40 mt-1">Password used to extract the software. Will be rendered as a copyable badge.</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-white/70 text-sm flex items-center gap-2"><Download size={14} /> Download Mirrors (Multi-link)</label>
                        <button type="button" onClick={() => setMirrors([...mirrors, { name: '', url: '' }])} className="text-xs bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
                            <Plus size={14} /> Add Mirror
                        </button>
                    </div>
                    {mirrors.length === 0 ? (
                        <p className="text-sm text-white/30 italic px-4 py-3 bg-white/5 rounded-xl">No mirrors added. Standard download link will be used.</p>
                    ) : (
                        <div className="space-y-3">
                            {mirrors.map((mirror, i) => (
                                <div key={i} className="flex gap-4">
                                    <input placeholder="e.g. Mega, Google Drive" value={mirror.name} onChange={(e) => { const newM = [...mirrors]; newM[i].name = e.target.value; setMirrors(newM); }} className="w-1/3 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                    <input placeholder="https://..." value={mirror.url} onChange={(e) => { const newM = [...mirrors]; newM[i].url = e.target.value; setMirrors(newM); }} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none" />
                                    <button type="button" onClick={() => setMirrors(mirrors.filter((_, idx) => idx !== i))} className="px-3 text-red-400 hover:bg-red-400/10 rounded-xl transition"><XCircle size={18} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-white/70 text-sm mb-2 flex items-center gap-2 font-semibold uppercase tracking-tight">
                            <MonitorPlay size={14} /> {activeTab} System Requirements
                        </label>
                        <textarea
                            value={formData[f('system_requirements')] || ''}
                            onChange={h(f('system_requirements'))}
                            placeholder="OS: Windows 10&#10;RAM: 8GB&#10;Storage: 20GB"
                            rows="5"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 custom-scrollbar transition"
                        />
                    </div>
                    <div>
                        <label className="block text-white/70 text-sm mb-2 flex items-center gap-2 font-semibold uppercase tracking-tight">
                            <ListPlus size={14} /> {activeTab} Changelog
                        </label>
                        <textarea
                            value={formData[f('changelog')] || ''}
                            onChange={h(f('changelog'))}
                            placeholder="v2.0: Added new features&#10;v1.9: Fixed bugs"
                            rows="5"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 custom-scrollbar transition"
                        />
                    </div>
                </div>
            </div>

            {/* Scraped Info Grid */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white/70 text-sm mb-2">Downloadable Link *</label>
                        <input required value={formData.downloadable_link} onChange={h('downloadable_link')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none" />
                    </div>
                </div>
                <h3 className="text-white font-medium mb-4 pb-2 border-b border-white/10 mt-6 flex items-center gap-2">
                    <Info size={18} className="text-purple-400" />
                    Software Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries({
                        'Software Name': 'software_name',
                        'Version': 'software_version',
                        'Publisher': 'publisher_name',
                        'App Category': 'application_category',
                        'OS': 'operating_system',
                        'Licence': 'licence',
                        'File Size': 'file_size',
                        'Date Published': 'date_published',
                        'Date Modified': 'date_modified',
                        'Price': 'price',
                        'Review Count': 'review_count',
                        'Rating': 'rating_value',
                    }).map(([label, key]) => {
                        const isTranslatable = ['software_name'].includes(key);
                        const fieldName = isTranslatable ? f(key) : key;
                        return (
                            <div key={key}>
                                <label className="block text-white/50 text-xs mb-1 uppercase tracking-wider">
                                    {isTranslatable ? `${activeTab} ` : ''}{label}
                                </label>
                                <input
                                    value={formData[fieldName] || ''}
                                    onChange={h(fieldName)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                                    placeholder={label}
                                />
                            </div>
                        );
                    })}
                    {/* Software Description handled specially as it is translatable */}
                    <div className="col-span-1 md:col-span-3">
                        <label className="block text-white/50 text-xs mb-1 uppercase tracking-wider">{activeTab} Software Description</label>
                        <textarea
                            value={formData[f('software_description')] || ''}
                            onChange={h(f('software_description'))}
                            rows="2"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                            placeholder="Briefly describe the software..."
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-white/70 text-sm font-semibold uppercase tracking-tight flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-400" />
                    {activeTab} Full Blog Content (WordPress style)
                </label>
                <div key={activeTab} className="animate-in fade-in duration-500">
                    <TiptapEditor content={formData[f('detail')] || ''} onChange={h(f('detail'))} />
                </div>
            </div>

            <div className="pt-8 flex justify-end gap-4 border-t border-white/10">
                <a href="/admin/blogs" className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition font-medium">Cancel</a>

                {blog?.slugs && (
                    <button
                        type="button"
                        onClick={() => {
                            const cookies = document.cookie.split('; ');
                            const urlCookie = cookies.find(row => row.startsWith('cms_api_url='));
                            let baseUrl = 'http://localhost:3000';
                            if (urlCookie) baseUrl = decodeURIComponent(urlCookie.split('=')[1]).replace(/\/api$/, '').replace(/\/$/, '');
                            window.open(`${baseUrl}/blogs/${blog.slugs}`, '_blank');
                        }}
                        className="px-6 py-3 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition font-medium flex items-center gap-2"
                    >
                        <Eye size={18} /> Review / Preview
                    </button>
                )}

                <button disabled={loading} type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-3 rounded-xl font-bold transition disabled:opacity-50">
                    {loading ? 'Saving to Database...' : 'Save Blog Post'}
                </button>
            </div>
        </form>
    );
}
