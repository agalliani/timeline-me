import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Timesheet, { BubbleModel, TimelineItem } from 'src/app/models/Timesheet';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../dialogs/edit-dialog/edit-dialog.component';
import html2canvas from 'html2canvas';
import { TimelineService } from 'src/app/services/timeline.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  altezza = 0
  lineHeigth = 32;
  data: TimelineItem[] = [];

  timelineForm = this.formbuilder.group({
    start: ["2018-02", Validators.required],
    end: ["2023-01", Validators.required],
    label: ["Write a description, a title, a job...", Validators.required],
    category: [""]
  })

  minYear!: number;
  maxYear!: number;

  message: string | undefined;
  years: number[] = [];
  bubbles: BubbleModel[] = [];

  @ViewChild('timeline', { static: false })
  timeline!: ElementRef;
  @ViewChild('downloadLink')
  downloadLink!: ElementRef;


  constructor(
    @Inject(DOCUMENT) private document: Document,
    private formbuilder: FormBuilder,
    public dialog: MatDialog,
    private timelineService: TimelineService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Check for URL parameters first
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        this.timelineService.loadFromUrl(params['data']);
        // Clean URL after loading? Maybe not, so they can bookmark it.
      }
    });

    this.timelineService.timelineData$.subscribe(data => {
      this.data = data;
      this.drawLines();
    });
  }

  drawLines() {
    if (this.data.length > 0) {
      this.message = undefined;

      // Calculate min/max years from the TimelineItem[]
      let minY = 9999;
      let maxY = 0;

      this.data.forEach(item => {
        const startY = parseInt(item.start.split('/')[1]);
        const endY = item.end ? parseInt(item.end.split('/')[1]) : startY;

        if (startY < minY) minY = startY;
        if (endY > maxY) maxY = endY;
        if (startY > maxY) maxY = startY;
      });

      this.minYear = minY;
      this.maxYear = maxY;

      this.altezza = this.data.length * this.lineHeigth + 39;

      const timesheet = new Timesheet(this.minYear, this.maxYear, this.data);
      this.years = timesheet.getYears();
      this.bubbles = timesheet.getBubbles(59);

      setTimeout(() => {
        this.saveAsImage()
      }, 500);

    } else {
      this.message = `Click the "add a time-line" button to see magic :)`
      this.years = [];
      this.bubbles = [];
      this.altezza = 0;
    }
  }


  onSubmit() {
    if (this.timelineForm.valid) {
      const startVal = this.timelineForm.value.start;
      const endVal = this.timelineForm.value.end;

      const newItem: TimelineItem = {
        start: startVal ? `${startVal.split("-")[1]}/${startVal.split("-")[0]}` : "",
        end: endVal ? `${endVal.split("-")[1]}/${endVal.split("-")[0]}` : null,
        label: this.timelineForm.value.label || "",
        category: this.timelineForm.value.category || "default"
      };

      this.timelineService.addItem(newItem);
    }
  }

  editLine(index: number) {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {
        line: this.data[index],
        index: index
      }
    })

    dialogRef.afterClosed().subscribe((result: TimelineItem) => {
      if (result) {
        this.timelineService.updateItem(index, result);
      }
    })
  }

  deleteLine(index: number) {
    if (confirm(`Are you sure you want to delete the time-line #${index}?`)) {
      this.timelineService.deleteItem(index);
    }
  }

  saveAsImage() {
    /* Converting the html element to a canvas element and then converting it to a png image. */
    if (this.timeline && this.timeline.nativeElement) {
      html2canvas(this.timeline.nativeElement).then((canvas: any) => {
        this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
        this.downloadLink.nativeElement.download = `timeline-${new Date().toJSON().replace("T", "-").slice(0, -5)}.png`;
      });
    }
  }

  onCopyLink() {
    const link = this.timelineService.generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    });
  }
}
