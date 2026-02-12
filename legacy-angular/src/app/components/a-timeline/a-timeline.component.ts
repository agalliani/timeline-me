import { DOCUMENT } from '@angular/common';
import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnChanges, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import Bubble from 'src/app/models/Bubble';

interface TimelineData {
  start: Date;
  end: Date;
  label: string;
  type: string;
}

@Component({
  selector: 'app-a-timeline',
  templateUrl: './a-timeline.component.html',
  styleUrls: ['./a-timeline.component.css']
})
export class ATimelineComponent implements OnInit, AfterViewInit {
  data: TimelineData[] = [
    {
      start: new Date(2002, 0, 1),
      end: new Date(2004, 1),
      label: "",
      type: ""
    }
  ];
  minYear: number = 0;
  maxYear: number = 0;
  rangeYear: number[] | undefined;

  widthMonth!: number;

  @ViewChild('yearCol') yearCol: ElementRef | undefined
  @ViewChild('timesheet') timesheet: ElementRef | undefined
  this: any;

  flag = false



  constructor(private changeDetectorRef: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.minYear = this.data.reduce((prev: TimelineData, curr: TimelineData) => prev.start < curr.start ? prev : curr).start.getFullYear()
    this.maxYear = this.data.reduce((prev: TimelineData, curr: TimelineData) => prev.end > curr.end ? prev : curr).end.getFullYear()

    this.rangeYear = _.range(this.minYear, this.maxYear + 1)



  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.widthMonth = (this.yearCol?.nativeElement as HTMLElement).offsetWidth
      this.insertData()
    })

  }



  @HostListener('window:resize', ['$event'])
  onResize(event: any) {





    //console.log(window.innerWidth)


  }


  insertData() {
    const html: string[] = [];
    const widthMonth = this.yearCol?.nativeElement.offsetWidth;

    for (let n = 0, m = this.data.length; n < m; n++) {
      const cur = this.data[n];
      const bubble = this.createBubble(widthMonth, this.minYear, cur.start, cur.end);
      const line = [
        '<span style="margin-left: ' + bubble.getStartOffset() + 'px; width: ' + bubble.getWidth() + 'px;" class="bubble bubble-' + (cur.type || 'default') + '"></span>',
        '<span class="date">' + bubble.getDateLabel() + '</span> ',
        '<span class="label">' + cur.label + '</span>'
      ].join('');

      html.push('<li>' + line + '</li>');
    }


    this.timesheet!.nativeElement.outerHTML += '<ul class="data">' + html.join('') + '</ul>';
  }

  createBubble(wMonth: any, min: number, start: any, end: any) {
    return new Bubble(wMonth, min, start, end);
  }



  changeWidth() {
    return { 'width': this.widthMonth }
  }



  getBubbleMarginLeft(bubble: TimelineData) {
    return ((this.yearCol?.nativeElement as HTMLElement).offsetWidth / 12) * (12 * bubble.start.getFullYear() - this.minYear) +
      bubble.start.getMonth()
  }


  getBubbleWidth(bubble: TimelineData) {
    return ((this.yearCol?.nativeElement as HTMLElement).offsetWidth / 12) * this.getBubbleMonths(bubble);

  }

  getFullYears(bubble: TimelineData) {
    (bubble.end.getFullYear() - bubble.start.getFullYear())
    return ((bubble.end && bubble.end.getFullYear()) || bubble.start.getFullYear()) - bubble.start.getFullYear();
  }

  getBubbleMonths(bubble: TimelineData) {
    let fullYears = this.getFullYears(bubble);
    let months = (this.yearCol?.nativeElement as HTMLElement).offsetWidth / 12 * (12 - bubble.start.getMonth() + 12 * ((bubble.end.getFullYear() - bubble.start.getFullYear()) - 1 > 0 ? fullYears - 1 : 0))

    return months;
  }

}
