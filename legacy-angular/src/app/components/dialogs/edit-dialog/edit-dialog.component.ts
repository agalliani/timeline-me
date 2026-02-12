import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimelineItem } from 'src/app/models/TimelineItem';


@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.css']
})
export class EditDialogComponent {

  timelineEditForm = this.formbuilder.group({
    start: [this.convertDateToInput(this.data.line.start), Validators.required],
    end: [this.data.line.end ? this.convertDateToInput(this.data.line.end) : '', Validators.required],
    label: [this.data.line.label, Validators.required],
    category: [this.data.line.category]
  })

  constructor(public dialogRef: MatDialogRef<EditDialogComponent>, private formbuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { line: TimelineItem, index: number }) { }


  onSubmit() {
    const startVal = this.timelineEditForm.value.start;
    const endVal = this.timelineEditForm.value.end;

    // Convert YYYY-MM to MM/YYYY
    const formattedStart = startVal ? `${startVal.split("-")[1]}/${startVal.split("-")[0]}` : "";
    const formattedEnd = endVal ? `${endVal.split("-")[1]}/${endVal.split("-")[0]}` : null;

    const result: TimelineItem = {
      start: formattedStart,
      end: formattedEnd,
      label: this.timelineEditForm.value.label || "",
      category: this.timelineEditForm.value.category || ""
    };

    this.dialogRef.close(result);
  }

  close() {
    this.dialogRef.close();
  }

  private convertDateToInput(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 2) {
      return `${parts[1]}-${parts[0]}`; // MM/YYYY to YYYY-MM
    }
    return dateStr;
  }
}
