// download button
const downloadButton = document.createElement('button');
downloadButton.innerText = 'Download ICS File';
downloadButton.classList.add("d21-button");
Object.assign(downloadButton.style, {
    position: 'absolute',
    left: '255px',
    top: '254px',
    width: '140px',
    height: '42px',
    cursor: 'pointer',
    zIndex: 9999,
});

downloadButton.style.color = "#202122";
downloadButton.style.backgroundColor = "#e3e9f1";
downloadButton.style.fontWeight = "700";
downloadButton.style.fontSize = ".7rem";
downloadButton.style.fontFamily = "inherit";
downloadButton.style.borderStyle = "none";

// append the button so it actually shows
document.body.appendChild(downloadButton);

// select all button
const selectAllButton = document.createElement('button');
selectAllButton.innerText = 'Select All';
selectAllButton.classList.add("d21-button");
Object.assign(selectAllButton.style, {
    position: 'absolute',
    left: '410px',
    top: '254px',
    width: '140px',
    height: '42px',
    cursor: 'pointer',
    zIndex: 9999,
});

selectAllButton.style.color = "#202122";
selectAllButton.style.backgroundColor = "#e3e9f1";
selectAllButton.style.fontWeight = "700";
selectAllButton.style.fontSize = ".7rem";
selectAllButton.style.fontFamily = "inherit";
selectAllButton.style.borderStyle = "none";

// append the button so it actually shows
document.body.appendChild(selectAllButton);

// check boxes for each assignment
const table = document.getElementById('z_a');
const assignments = table.querySelectorAll('tr');
var titleRows = []; // keeps track of where title rows are
// start at 2 to skip the first two title rows
for (let i = 2; i < assignments.length; i++) {
    // doesn't add checkboxes for title rows
    if (!assignments[i].classList.contains('d_ggl2')) {
        const checkBox = document.createElement('input');
        checkBox.classList.add('assignment-checkbox');
        checkBox.type = 'checkbox';
        Object.assign(checkBox.style, {
            position: 'absolute',
            left: '-40px',
            width: '25px',
            height: '25px',
            cursor: 'pointer',
            zIndex: 9999
        });

        checkBox.style.marginTop = assignments[i].offsetHeight / 2 - 12 + 'px';

        assignments[i].appendChild(checkBox);
    }
    else {
        titleRows.push(i);
    }
}

// event listeners for buttons
selectAllButton.addEventListener('click', () => {
    const boxes = document.getElementsByClassName('assignment-checkbox');
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].checked = true;
    };
});

function findAssignmentIndex(i) {
    //finds the index as variable j of the selected assignment
    let j = i + 2;
    
    for (let k = 0; k < titleRows.length; k++) {
        if (j >= titleRows[k]) {
            j++;
        }
        else {
            return j;
        }
    }

    return j;
}

function dateDecoder(dateString) {
    // expects strings like: "Due on Sep 24, 2025 4:59 PM"
    const m = dateString.match(/([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return ""; // return empty on unexpected format

    const [, monStr, dayStr, yearStr, hourStr, minStr, ampmRaw] = m;
    const ampm = ampmRaw.toUpperCase();

    const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const year = parseInt(yearStr, 10);
    const month = months[monStr.slice(0, 3)] ?? 0;
    const day = parseInt(dayStr, 10);

    let hour = parseInt(hourStr, 10);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    const minute = parseInt(minStr, 10);

    // Construct a Date object
    const d = new Date(year, month, day, hour, minute);

    // If you want to *increment* the time (e.g., for DTEND being after DTSTART), do it here:
    // Example: add 1 minute
    const dEnd = new Date(d.getTime() + 60 * 1000);

    // Format helper
    function fmt(dateObj) {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const hh = String(dateObj.getHours()).padStart(2, "0");
        const min = String(dateObj.getMinutes()).padStart(2, "0");
        return `${yyyy}${mm}${dd}T${hh}${min}00`;
    }

    return {
        start: fmt(d),
        end: fmt(dEnd)
    };
}

var icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//UWaterlooLearnDropboxes//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
function addToICS(i) {
    const courseTitleEle = document.getElementsByClassName('d2l-navigation-s-link');
    const courseTitle = courseTitleEle[0].innerText;

    const assignmentTitle = assignments[i].children[0].children[0].children[0].children[0].children[0].children[0].innerText;
    const assignmentDesc = assignments[i].children[0].children[0].children[0].children[0].children[0].children[0].href;
    const assignmentDate = dateDecoder(assignments[i].children[0].children[3].children[0].children[0].children[0].children[0].innerText);
    const assignmentLink = assignments[i].children[1].children[0].href;

    icsContent += "BEGIN:VEVENT\n";
    icsContent += "SUMMARY:" + courseTitle + " | " + assignmentTitle + "\n";
    icsContent += "DESCRIPTION:" + assignmentTitle + " is " + assignments[i].children[0].children[3].children[0].children[0].children[0].children[0].innerText + ". You can learn more about the assignment at " + assignmentDesc + " and submit your assignment at " + assignmentLink + "\n";
    icsContent += "UID:" + assignmentDate.start + + i + "@uwaterlooLearnDropboxes\n";
    icsContent += "DTSTAMP:" + assignmentDate.start + "Z\n";
    icsContent += "DTSTART:" + assignmentDate.start + "\n";
    icsContent += "DTEND:" + assignmentDate.end + "\n";
    icsContent += "END:VEVENT\n";
}

function downloadICS() {
    icsContent += "END:VCALENDAR";
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(icsContent);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'learnCalendar.ics';
    hiddenElement.click();

    icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//UWaterlooLearnDropboxes//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
}

//downloads event listener
downloadButton.addEventListener('click', () => {
    const boxes = document.getElementsByClassName('assignment-checkbox');
    for (let i = 0; i < boxes.length; i++) {
        //condition to download
        if (boxes[i].checked) {
            addToICS(findAssignmentIndex(i));
        }
    }
    downloadICS();
});