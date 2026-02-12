export default class Bubble {

 widthMonth: any
 min: any
 start: any
 end: any



 constructor(widthMonth: any,
  min: any,
  start: any,
  end: any) {
  this.min = min;
  this.start = start;
  this.end = end;
  this.widthMonth = widthMonth;

 }



 /**
  * If the number is greater than or equal to 10, return the number, otherwise return the number with a
  * 0 in front of it.
  * </code>
  * @param {number} num - number - The number to format.
  * @returns a string.
  */
 formatMonth(num: number) {
  return num >= 10 ? num : '0' + num;
 }

 getStartOffset() {
  return (this.widthMonth / 12) * (12 * (this.start.getFullYear() - this.min) + this.start.getMonth());
 }

 getFullYears() {
  return ((this.end && this.end.getFullYear()) || this.start.getFullYear()) - this.start.getFullYear();
 }

 /**
  * If the end date is not set, then return the number of months between the start date and the end of
  * the year. If the end date is set, then return the number of months between the start date and the
  * end date.
  * @returns The number of months between the start and end dates.
  */
 getMonths() {
  const fullYears = this.getFullYears();
  let months = 0;

  if (!this.end) {
   months += !this.start.hasMonth ? 12 : 1;
  }
  else {
   if (!this.end.hasMonth) {
    months += 12 - (this.start.hasMonth ? this.start.getMonth() : 0);
    months += 12 * (fullYears - 1 > 0 ? fullYears - 1 : 0);
   } else {
    months += this.end.getMonth() + 1;
    months += 12 - (this.start.hasMonth ? this.start.getMonth() : 0);
    months += 12 * (fullYears - 1);
   }
  }

  return months;
 }

 getWidth() {
  return (this.widthMonth / 12) * this.getMonths();
 }

 getDateLabel() {
  return [
   (this.start.hasMonth ? this.formatMonth(this.start.getMonth() + 1) + '/' : '') + this.start.getFullYear(),
   (this.end ? '-' + ((this.end.hasMonth ? this.formatMonth(this.end.getMonth() + 1) + '/' : '') + this.end.getFullYear()) : '')
  ].join('');
 }

}




