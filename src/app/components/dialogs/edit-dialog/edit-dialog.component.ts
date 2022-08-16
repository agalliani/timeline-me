import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.css']
})
export class EditDialogComponent  {



  timelineEditForm = this.formbuilder.group({
    start: this.data[0].split("/")[1]+"-"+this.data[0].split("/")[0],
    end: this.data[1].split("/")[1]+"-"+this.data[1].split("/")[0],
    label: this.data[2],
    category: this.data[3]
  })

  constructor(public dialogRef: MatDialogRef<EditDialogComponent>, private formbuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: string[]) { }


  onSubmit() {
    this.dialogRef.close([this.timelineEditForm.value.start?.split("-")[1] + "/" + this.timelineEditForm.value.start?.split("-")[0], this.timelineEditForm.value.end?.split("-")[1] + "/" + this.timelineEditForm.value.end?.split("-")[0], this.timelineEditForm.value.label ?? "", this.timelineEditForm.value.category ?? ""])
  }


}
