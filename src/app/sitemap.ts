import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: siteConfig.url,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
    ];
}
