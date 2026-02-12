import { Injectable } from '@angular/core';
import { TimelineItem } from '../models/TimelineItem';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TimelineService {
    private timelineDataSubject = new BehaviorSubject<TimelineItem[]>([]);
    public timelineData$: Observable<TimelineItem[]> = this.timelineDataSubject.asObservable();

    constructor() {
        this.loadFromStorage();
    }

    getTimelineData(): TimelineItem[] {
        return this.timelineDataSubject.value;
    }

    setTimelineData(data: TimelineItem[]) {
        this.timelineDataSubject.next(data);
        this.saveToStorage(data);
    }

    addItem(item: TimelineItem) {
        const currentData = this.getTimelineData();
        const newData = [...currentData, item];
        this.setTimelineData(newData);
    }

    updateItem(index: number, item: TimelineItem) {
        const currentData = this.getTimelineData();
        if (index >= 0 && index < currentData.length) {
            const newData = [...currentData];
            newData[index] = item;
            this.setTimelineData(newData);
        }
    }

    deleteItem(index: number) {
        const currentData = this.getTimelineData();
        if (index >= 0 && index < currentData.length) {
            const newData = currentData.filter((_, i) => i !== index);
            this.setTimelineData(newData);
        }
    }

    private saveToStorage(data: TimelineItem[]) {
        // Convert strict objects back to the legacy array format for localStorage naming compatibility if needed, 
        // OR migrate to a cleaner JSON format. 
        // For now, let's stick to the existing format [start, end, label, category] for backward compatibility 
        // or better yet, let's MIGRATE to object storage because it's cleaner.
        // BUT user data is currently array-based.

        // Let's support BOTH. If we save, we save as objects in a NEW key, or overwrite the old one?
        // Let's overwrite 'data' with the new object structure? 
        // Wait, the existing code uses `JSON.parse(localStorage.getItem('data') || '[]')` which expects arrays.
        // Let's keep the array format for `data` key to ensure if they reload with old code it "might" work,
        // actually, no, we are refactoring. Let's use a new key 'timeline_data' for objects, 
        // and migrating old data if found.

        // Actually, let's keep it simple. Let's stick to the array format for storage for this step 
        // to minimize friction, OR break it and migrate.
        // Given "Refactor any types", migrating to objects is better.

        const serialized = JSON.stringify(data);
        localStorage.setItem('timeline_data_v2', serialized);
    }

    private loadFromStorage() {
        // Try loading v2
        const v2Data = localStorage.getItem('timeline_data_v2');
        if (v2Data) {
            this.timelineDataSubject.next(JSON.parse(v2Data));
            return;
        }

        // Fallback: Try loading legacy v1
        const v1Data = localStorage.getItem('data');
        if (v1Data) {
            const parsed: string[][] = JSON.parse(v1Data);
            const migrated: TimelineItem[] = parsed.map(row => ({
                start: row[0],
                end: row[1] || null,
                label: row[2],
                category: row[3] || 'default'
            }));
            this.timelineDataSubject.next(migrated);
        }
    }

    // URL State Management
    generateShareLink(): string {
        const data = this.getTimelineData();
        const json = JSON.stringify(data);
        const encoded = btoa(json); // Simple Base64 for now. Could use lz-string for compression later.
        return `${window.location.origin}/#/timeline?data=${encoded}`;
    }

    loadFromUrl(encodedData: string) {
        try {
            const json = atob(encodedData);
            const data: TimelineItem[] = JSON.parse(json);
            this.setTimelineData(data); // This also saves to local storage, effectively importing it.
        } catch (e) {
            console.error('Failed to parse data from URL', e);
        }
    }
}
