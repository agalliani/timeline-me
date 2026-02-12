import Bubble from "./Bubble";
import { TimelineItem } from "./TimelineItem";

export { TimelineItem };

export interface ParsedTimelineItem {
  start: Date;
  end: Date | null;
  label: string;
  type: string;
}

export interface BubbleModel {
  marginLeft: number;
  width: number;
  class: string;
  duration: string;
  dateLabel: string;
  label: string;
}

export default class Timesheet {
  data: ParsedTimelineItem[];
  year: {
    min: number,
    max: number
  };
  widthMonth: number = 59; // Default width from CSS

  constructor(min: number, max: number, data: TimelineItem[]) {
    this.data = [];
    this.year = { min: min, max: max }
    this.parse(data || []);
  }

  parse(data: TimelineItem[]) {
    for (let n = 0, m = data.length; n < m; n++) {
      const item = data[n];
      const begin = this.parseDate(item.start);
      // Determine end date: if item.end is present, parse it.
      const end = item.end ? this.parseDate(item.end) : null;

      if (begin.date.getFullYear() < this.year.min) {
        this.year.min = begin.date.getFullYear();
      }

      if (end && end.date.getFullYear() > this.year.max) {
        this.year.max = end.date.getFullYear();
      } else if (begin.date.getFullYear() > this.year.max) {
        this.year.max = begin.date.getFullYear();
      }

      this.data.push({
        start: begin.date,
        end: end?.date || null,
        label: item.label,
        type: item.category
      });
    }
  }

  parseDate(dateInfo: string) {
    const dateObj = { date: new Date(), hasMonth: false }

    if (dateInfo.includes('/') === false) {
      dateObj.date = new Date(parseInt(dateInfo, 10), 0, 1);
      dateObj.hasMonth = false;
    }
    else {
      const splittedDateInfo = dateInfo.split('/');
      dateObj.date = new Date(parseInt(splittedDateInfo[1], 10), parseInt(splittedDateInfo[0], 10), -1, 1)
      dateObj.hasMonth = true
    }

    return dateObj
  }

  getYears(): number[] {
    const years = [];
    for (let c = this.year.min; c <= this.year.max + 2; c++) {
      years.push(c);
    }
    return years;
  }

  getBubbles(widthMonth: number): BubbleModel[] {
    const bubbles: BubbleModel[] = [];

    for (let n = 0, m = this.data.length; n < m; n++) {
      const cur = this.data[n];
      const bubble = new Bubble(widthMonth, this.year.min, cur.start, cur.end);

      bubbles.push({
        marginLeft: bubble.getStartOffset(),
        width: bubble.getWidth(),
        class: 'bubble bubble-' + (cur.type || 'default'),
        duration: cur.end ? Math.round((cur.end.getTime() - cur.start.getTime()) / 1000 / 60 / 60 / 24 / 39).toString() : '',
        dateLabel: bubble.getDateLabel(),
        label: cur.label
      });
    }

    // Add empty bubble for offset
    const offsetStart = new Date(this.year.min, 0, -1, 1);
    const offsetEnd = new Date(this.year.max + 2, 11, -1, 1);
    const offsetBubble = new Bubble(widthMonth, this.year.min, offsetStart, offsetEnd);

    bubbles.push({
      marginLeft: 0,
      width: offsetBubble.getWidth(),
      class: 'bubble bubble-empty',
      duration: '',
      dateLabel: '',
      label: ''
    });

    return bubbles;
  }
}
