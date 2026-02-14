const monthNames = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre";

// Current failing regex (simulated)
// The issue is likely that monthNames comes before the "Month Year" pattern
const dateRangeRegexBad = new RegExp(`^(${monthNames})\\s(\\d{4})\\s*[-–—]\\s*(${monthNames}|Present|Presente|[A-Za-z]+\\s\\d{4})`, 'i');

// Proposed fix: put "Month Year" pattern first
// We construct it to explicitly look for Month + Space + Year
const dateRangeRegexGood = new RegExp(`^(${monthNames})\\s(\\d{4})\\s*[-–—]\\s*(Present|Presente|(${monthNames})\\s\\d{4}|[A-Za-z]+\\s\\d{4})`, 'i');

const input = "agosto 2015 - aprile 2016";

console.log("Testing Input:", input);

const matchBad = input.match(dateRangeRegexBad);
if (matchBad) {
    console.log("BAD Regex Match:");
    console.log("Start:", matchBad[1], matchBad[2]); // Month, Year
    console.log("End Group:", matchBad[3]); // Should be "aprile 2016", likely "aprile"
} else {
    console.log("BAD Regex: No match");
}

const matchGood = input.match(dateRangeRegexGood);
if (matchGood) {
    console.log("GOOD Regex Match:");
    console.log("Start:", matchGood[1], matchGood[2]);
    console.log("End Group:", matchGood[3]);
} else {
    console.log("GOOD Regex: No match");
}
