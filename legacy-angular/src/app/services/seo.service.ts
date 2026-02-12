import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class SeoService {

    constructor(private title: Title, private meta: Meta) { }

    updateTitle(title: string) {
        this.title.setTitle(title);
        this.meta.updateTag({ name: 'og:title', content: title });
        this.meta.updateTag({ name: 'twitter:title', content: title });
    }

    updateMetaTags(config: { description?: string, image?: string, slug?: string }) {
        if (config.description) {
            this.meta.updateTag({ name: 'description', content: config.description });
            this.meta.updateTag({ name: 'og:description', content: config.description });
            this.meta.updateTag({ name: 'twitter:description', content: config.description });
        }

        if (config.image) {
            this.meta.updateTag({ name: 'og:image', content: config.image });
            this.meta.updateTag({ name: 'twitter:image', content: config.image });
        }

        if (config.slug) {
            this.meta.updateTag({ name: 'og:url', content: `https://timeline-me.github.io/${config.slug}` });
        }
    }

    generateTags(config: { title: string, description: string, image: string, slug: string }) {
        this.updateTitle(config.title);
        this.updateMetaTags(config);
    }
}
