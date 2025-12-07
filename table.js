const tableMain = document.querySelector(".row-container");

// Helper function to reset hidden columns
export function resetColumns() {
  resetInputs();

  // class "hideable" is used to signify all hideable columns
  const allHideable = document.querySelectorAll(".hideable");
  allHideable.forEach((elem) => {
    if (!elem.classList.contains("hide")) {
      elem.classList.add("hide");
    }
  });
}

const errorDisplay = document.querySelector(".error-msg");
let hasError = false; // for table
let hasMLQError = false; // for table with mlq
// check if inputs are wrong or empty
export function verifyInputs() {
  const allInputs = tableMain.querySelectorAll("input");

  // reset error state first
  hasError = false;
  hasMLQError = false; // if user inputs a number greater than 2
  errorDisplay.textContent = "";

  // check all inputs again
  allInputs.forEach((input) => {
    input.style.backgroundColor = "white";
    const val = input.value;
    if (input.parentElement.classList.contains("hide")) {
      // ignore hidden columns
      return;
    }
    if (val == "" || !/^\d+$/.test(val)) {
      input.style.backgroundColor = "#ffcccc";
      hasError = true;
    }
  });

  // check mlq queue inputs
  const mlqInputs = tableMain.querySelectorAll(".queue-num > input");
  mlqInputs.forEach((input) => {
    const val = input.value;
    if (input.parentElement.classList.contains("hide")) {
      // ignore hidden columns
      return;
    }
    if (val != 1 && val != 2) {
      input.style.backgroundColor = "#ffcccc";
      hasError = true;
      hasMLQError = true;
    }
  });

  let errorText = "";
  // determine the error message: with MLQ error or without
  if (hasError) {
    errorText = "Invalid Inputs";
  }
  if (hasMLQError) {
    errorText += ", Invalid Queue Number";
  }
  errorDisplay.textContent = errorText;
  return hasError;
}
export function resetInputs() {
  const allInputs = tableMain.querySelectorAll("input");
  allInputs.forEach((input) => {
    input.style.backgroundColor = "white";
  });
  errorDisplay.textContent = "";
}

// update number of table rows
// needs input of number of processes selected
export function updateTableRows(algoType, numOfProcesses) {
  console.log("updating Table");
  const currentRowCount = getRowCount();
  // if no changes to number of processes -> ignore
  if (numOfProcesses == currentRowCount) {
    return;
    // Case 1: adding rows
  } else if (numOfProcesses > currentRowCount) {
    addRowFrom(currentRowCount + 1, numOfProcesses);
    // Case 2: removing rows
  } else if (numOfProcesses < currentRowCount) {
    removeRowsFrom(numOfProcesses + 1);
  }

  // if priority algo type
  if (algoType == "priority") {
    showPriorityRows();
  } else if (algoType == "mlq") {
    showPriorityRows();
    showMLQRows();
  } else if (algoType == "deadline") {
    showDeadlineRows();
  }

  // Helper function to add empty rows
  function addRowFrom(startNum, endNum) {
    const lastRow = tableMain.lastElementChild; // get last row = average row

    while (startNum <= endNum) {
      const newRow = createNewRow(startNum);
      tableMain.insertBefore(newRow, lastRow); // insert new rows before last row
      startNum++;
    }
  }
  // Helper function to create empty rows
  function createNewRow(num) {
    const row = document.createElement("tr");
    row.classList.add("table-row");
    row.innerHTML = `<td class="process">P${num}</td>
                  <td class="arrival-time">
                  <input pattern="[0-9]*" />
                </td>
                <td class="burst-time">
                  <input pattern="[0-9]*" />
                </td>
                <td class="priority-time hide hideable">
                  <input pattern="[0-9]*" />
                </td>
                <td class="queue-num hide">
                  <input pattern="[0-9]*" />
                </td>
                <td class="deadline-time hide hideable">
                  <input pattern="[0-9]*" />
                </td>
                <td class="start-time"></td>
                <td class="completion-time"></td>
                <td class="turnaround-time"></td>
                <td class="waiting-time"></td>
                <td class="response-time"></td>
                <td class="lateness-time hide hideable"></td>
                <td class="tardiness-time hide hideable"></td>`;
    return row;
  }
  // Helper function to remove rows from nth (except for last row)
  function removeRowsFrom(num) {
    const allRows = document.querySelectorAll(".table-container .table-row");
    let count = 1;
    // Iterates through all rows until it reaches num nth row
    allRows.forEach((row) => {
      if (count >= num) {
        row.remove();
        // remove row
        console.log(row);
      } else {
        count++;
      }
    });
  }
  // Helper function to get the rows (ie children) of tableMain
  function getRowCount() {
    return tableMain.querySelectorAll(".table-row").length;
  }
}

export function showPriorityRows() {
  // var for ave columns
  const avePrioRow = document.querySelector(".priority-ave");
  // vars for hidden columns
  const priorityHeader = document.querySelector(".priority-header");
  const priorityColumns = document.querySelectorAll(
    ".data-table .priority-time"
  );

  // display header
  priorityHeader.classList.remove("hide");
  // display 3rd column for priority
  priorityColumns.forEach((row) => {
    if (row.classList.contains("hide")) {
      row.classList.remove("hide");
    }
  });
  // add extra column in last row
  avePrioRow.classList.remove("hide");
}

export function showDeadlineRows() {
  // var for ave columns
  const aveDeadlineRow = document.querySelector(".deadline-ave");
  const aveLatenessRow = document.querySelector(".lateness-ave");
  const aveTardinessRow = document.querySelector(".tardiness-ave");

  aveDeadlineRow.classList.remove("hide");
  aveLatenessRow.classList.remove("hide");
  aveTardinessRow.classList.remove("hide");

  // var for hidden columns
  const deadlineHeader = document.querySelector(".deadline-header");
  const latenessHeader = document.querySelector(".lateness-header");
  const tardinessHeader = document.querySelector(".tardiness-header");

  deadlineHeader.classList.remove("hide");
  latenessHeader.classList.remove("hide");
  tardinessHeader.classList.remove("hide");

  // deadline column
  const deadlineInputCells = document.querySelectorAll(
    ".data-table .deadline-time"
  );
  deadlineInputCells.forEach((row) => {
    // Only remove the hide class if it's currently hidden
    if (row.classList.contains("hide")) {
      row.classList.remove("hide");
    }
  });

  // lateness column
  const latenessOutputCells = document.querySelectorAll(
    ".data-table .lateness-time"
  );
  latenessOutputCells.forEach((row) => {
    if (row.classList.contains("hide")) {
      row.classList.remove("hide");
    }
  });

  // tardiness column
  const tardinessOutputCells = document.querySelectorAll(
    ".data-table .tardiness-time"
  );
  tardinessOutputCells.forEach((row) => {
    if (row.classList.contains("hide")) {
      row.classList.remove("hide");
    }
  });
}

export function showMLQRows() {
  // check if priority is selected in one of the subqueues
  const subAlgorithm1 = document.getElementById("subQueue1");
  const subAlgorithm2 = document.getElementById("subQueue2");
  if (subAlgorithm1.value == "priority" || subAlgorithm2.value == "priority") {
    showPriorityRows();
  }

  // var for left interface
  const subqueueInt = document.querySelector(".mlq-suboptions");
  subqueueInt.classList.remove("hide");

  // var for mlq columns
  const queueHeader = document.querySelector(".queue-header");
  const aveQueueRow = document.querySelector(".queue-ave");
  const queueColumns = document.querySelectorAll(".data-table .queue-num");
  // display header
  queueHeader.classList.remove("hide");
  // display 4rd column for queue
  queueColumns.forEach((row) => {
    if (row.classList.contains("hide")) {
      row.classList.remove("hide");
    }
  });
  // add extra column in last row
  aveQueueRow.classList.remove("hide");
}

// function to display the table
// takes completed process array as an input
export function displayTable(process) {
  calculateValues(process);

  const allRows = document.querySelectorAll(".table-row");
  allRows.forEach((row) => {
    // 1. Extract the PID from the HTML row (e.g., "P1" -> 1)
    const pidText = row.querySelector(".process").textContent;
    const currentPID = parseInt(pidText.substring(1));

    // 2. Find the matching process object in the input array using the PID
    const matchingProcess = process.find((p) => p.PID === currentPID);

    if (matchingProcess) {
      const st = row.querySelector(".start-time");
      const ct = row.querySelector(".completion-time");
      const tt = row.querySelector(".turnaround-time");
      const wt = row.querySelector(".waiting-time");
      const rt = row.querySelector(".response-time");
      const lt = row.querySelector(".lateness-time");
      const tard = row.querySelector(".tardiness-time");

      st.textContent = matchingProcess.startTime;
      ct.textContent = matchingProcess.completionTime;
      tt.textContent = matchingProcess.turnaroundTime;
      wt.textContent = matchingProcess.waitingTime;
      rt.textContent = matchingProcess.responseTime;
      lt.textContent = matchingProcess.lateness;
      tard.textContent = matchingProcess.tardiness;
    }
  });

  // calculate and display averages
  calculateAvg(process);
}
// calculates tat, wt, rt, etc.
export function calculateValues(process) {
  process.forEach((p) => {
    // tat = ct - at
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    // wt = tat - bt
    p.waitingTime = p.turnaroundTime - p.burstTime;
    // rt = st - at
    p.responseTime = p.startTime - p.arrivalTime;
  });
}
// calculates and display averages
function calculateAvg(process) {
  let totalAT = 0;
  let totalBT = 0;
  let totalST = 0;
  let totalCT = 0;
  let totalTT = 0;
  let totalWT = 0;
  let totalRT = 0;
  let totalLT = 0;
  let totalTARD = 0;
  const count = process.length;

  process.forEach((p) => {
    // Accumulate totals for all required metrics
    totalAT += p.arrivalTime;
    totalBT += p.burstTime;
    totalST += p.startTime;
    totalCT += p.completionTime;
    totalTT += p.turnaroundTime;
    totalWT += p.waitingTime;
    totalRT += p.responseTime;
    totalLT += p.lateness;
    totalTARD += p.tardiness;
  });

  // Calculate averages
  const avgAT = (totalAT / count).toFixed(2);
  const avgBT = (totalBT / count).toFixed(2);
  const avgST = (totalST / count).toFixed(2);
  const avgCT = (totalCT / count).toFixed(2);
  const avgTT = (totalTT / count).toFixed(2);
  const avgWT = (totalWT / count).toFixed(2);
  const avgRT = (totalRT / count).toFixed(2);
  const avgLT = (totalLT / count).toFixed(2);
  const avgTARD = (totalTARD / count).toFixed(2);

  // display averages
  const aAve = document.querySelector(".arrival-ave");
  const bAve = document.querySelector(".burst-ave");
  const stAve = document.querySelector(".start-ave");
  const ctAve = document.querySelector(".completion-ave");
  const ttAve = document.querySelector(".turnaround-ave");
  const wtAve = document.querySelector(".waiting-ave");
  const rtAve = document.querySelector(".response-ave");
  const ltAve = document.querySelector(".lateness-ave");
  const tardAve = document.querySelector(".tardiness-ave");

  // Update the text content of the cells
  aAve.textContent = avgAT;
  bAve.textContent = avgBT;
  stAve.textContent = avgST;
  ctAve.textContent = avgCT;
  ttAve.textContent = avgTT;
  wtAve.textContent = avgWT;
  rtAve.textContent = avgRT;
  ltAve.textContent = avgLT;
  tardAve.textContent = avgTARD;
}

// clear set values in the table
// does not clear at, bt, prio, or queue
export function clearTableCalculations() {
  // all other rows
  const stA = document.querySelectorAll(".start-time");
  const ctA = document.querySelectorAll(".completion-time");
  const ttA = document.querySelectorAll(".turnaround-time");
  const wtA = document.querySelectorAll(".waiting-time");
  const rtA = document.querySelectorAll(".response-time");
  const ltA = document.querySelectorAll(".lateness-time");
  const tardA = document.querySelectorAll(".tardiness-time");

  // iterate through all classes above
  const allProcessCells = [stA, ctA, ttA, wtA, rtA, ltA, tardA];
  allProcessCells.forEach((nodeList) => {
    nodeList.forEach((cell) => {
      cell.textContent = "";
    });
  });

  // average rows
  const aAve = document.querySelector(".arrival-ave");
  const bAve = document.querySelector(".burst-ave");
  const stAve = document.querySelector(".start-ave");
  const ctAve = document.querySelector(".completion-ave");
  const ttAve = document.querySelector(".turnaround-ave");
  const wtAve = document.querySelector(".waiting-ave");
  const rtAve = document.querySelector(".response-ave");
  const ltAve = document.querySelector(".lateness-ave");
  const tardAve = document.querySelector(".tardiness-ave");

  // Update the text content of the cells
  aAve.textContent = "";
  bAve.textContent = "";
  stAve.textContent = "";
  ctAve.textContent = "";
  ttAve.textContent = "";
  wtAve.textContent = "";
  rtAve.textContent = "";
  ltAve.textContent = "";
  tardAve.textContent = "";
}

// create ganttChart
export function displayGanttChart(gantt) {
  let st = 0;
  gantt.forEach((process) => {
    // first check if process goes after another process
    if (process.startTime !== st) {
      // add empty cell
      addEmptyGanttCell(st);
      st = process.startTime;
    }

    addGanttCell(process.PID, process.startTime);
    st = process.completionTime;
  });
  // add last cell for time only
  const ganttTimeRow = document.querySelector(".gantt-time");
  const bottomCell = document.createElement("td");
  bottomCell.textContent = st;
  ganttTimeRow.append(bottomCell);
  // addEmptyGanttCell(st);
}
// adds gantt process & time cell
function addGanttCell(pid, st) {
  const ganttProcessRow = document.querySelector(".gantt-process");
  const ganttTimeRow = document.querySelector(".gantt-time");

  const topCell = document.createElement("td");
  topCell.textContent = `P${pid}`;
  const bottomCell = document.createElement("td");
  bottomCell.textContent = st;
  ganttProcessRow.append(topCell);
  ganttTimeRow.append(bottomCell);
}
// adds gantt time cell with empty process id
function addEmptyGanttCell(st) {
  const ganttProcessRow = document.querySelector(".gantt-process");
  const ganttTimeRow = document.querySelector(".gantt-time");

  const topCell = document.createElement("td");
  // add empty cell styles here
  const bottomCell = document.createElement("td");
  bottomCell.textContent = st;
  ganttProcessRow.append(topCell);
  ganttTimeRow.append(bottomCell);
}

// clear ganttChart
export function clearGanttChart() {
  const ganttProcessRow = document.querySelector(".gantt-process");
  const ganttTimeRow = document.querySelector(".gantt-time");

  ganttProcessRow.innerHTML = "";
  ganttTimeRow.innerHTML = "";
}
