// Important input variables
let numOfProcesses = 2; // default val
let algoType = "fcfs"; // default val

// Update input variables
function updateInputVariables() {
  const processes = document.getElementById("processnum");
  const algorithm = document.getElementById("algorithm");

  numOfProcesses = parseInt(processes.value);
  algoType = algorithm.value;
}

// var for error messages
const errorDisplay = document.querySelector(".error-msg");
let hasError = false; // for table

// Event listener -> Algorithm
const selectAlgorithmBtn = document.getElementById("algorithm");
selectAlgorithmBtn.addEventListener("change", () => {
  // var for ave columns
  const avePrioRow = document.querySelector(".priority-ave");
  // vars for hidden columns
  const priorityHeader = document.querySelector(".priority-header");
  const priorityColumns = document.querySelectorAll(
    ".data-table .priority-time"
  );

  // reset all columns
  resetColumns();

  // Special cases: Priority, Deadline, MLQ
  if (selectAlgorithmBtn.value == "priority") {
    // display 3rd column for priority
    priorityHeader.classList.remove("hide");
    priorityColumns.forEach((row) => {
      row.classList.remove("hide");
      console.log(row);
    });
    // add extra column in last row
    avePrioRow.classList.remove("hide");
  } else if (selectAlgorithmBtn.value == "dealdine") {
    // add table changes here
  } else if (selectAlgorithmBtn.value == "mlq") {
    // add table changes here
  }
});
// Helper function to reset hidden columns
function resetColumns() {
  const avePrioRow = document.querySelector(".priority-ave");
  const priorityHeader = document.querySelector(".priority-header");
  const priorityColumns = document.querySelectorAll(
    ".data-table .priority-time"
  );

  avePrioRow.classList.add("hide");
  priorityHeader.classList.add("hide");
  priorityColumns.forEach((row) => {
    row.classList.add("hide");
  });
}

// Event listener -> Process number
const selectProcessBtn = document.getElementById("processnum");
selectProcessBtn.addEventListener("change", () => {
  // check for input changes
  updateInputVariables();

  // check dropdowns first
  updateTableRows();
});

// Event listener -> Calculate button
const calculateBtn = document.getElementById("calculate-btn");
calculateBtn.addEventListener("click", () => {
  console.log("calculate!");

  // verify if all inputs are filled correctly
  errorDisplay.textContent = "";
  if (verifyInputs()) {
    errorDisplay.textContent = "Invalid Inputs";
    return; // don't continue since invalid input present
  }

  // get data from table
  getProcessData();
});

// Var for the table body to append rows to
const tableMain = document.querySelector(".row-container");

// check if inputs are wrong or empty
function verifyInputs() {
  hasError = false;
  const allInputs = tableMain.querySelectorAll("input");
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
  return hasError;
}

// update number of table rows
function updateTableRows() {
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

  console.log(getRowCount());

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
                  <td class="priority-time hide">
                    <input pattern="[0-9]*" />
                  </td>
                  <td class="start-time"></td>
                  <td class="finish-time"></td>
                  <td class="turnaround-time"></td>
                  <td class="waiting-time"></td>
                  <td class="response-time"></td>`;
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

// SJF
// Process = [PID, AT, BT]
function getProcessData() {
  const inputRows = document.querySelectorAll(".row-container .table-row");
  const processes = [];

  inputRows.forEach((row, index) => {
    const arrivalTime_input = row.querySelector(".arrival-time input");
    const arrivalTime = parseInt(arrivalTime_input.value) || 0;

    const burstTime_input = row.querySelector(".burst-time input");
    const burstTime = parseInt(burstTime_input.value) || 0;

    const priority_input = row.querySelector(".priority-time input");
    const priorityTime = 0;

    // for priority algo
    if (algoType == "priority") {
      priorityTime = parseInt(priority_input.value) || 0;
    }

    processes.push({
      PID: index + 1,
      arrivalTime: arrivalTime,
      burstTime: burstTime,
      priority: priorityTime,
    });
  });
  console.log(processes); // for testing
  return processes;
}

// Render & calculate Table based on array with P objects
// Only AT, BT, ST, CT (Prio for special cases) needed

// Render Gantt chart based on array with "P" objects

// Code under here runs immediately
