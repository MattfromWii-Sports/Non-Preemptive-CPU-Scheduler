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

// Event listener -> Process number
const selectProcessBtn = document.getElementById("processnum");
selectProcessBtn.addEventListener("click", () => {
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

// check if inputs are worng or empty
function verifyInputs() {
  hasError = false;
  const allInputs = tableMain.querySelectorAll("input");
  allInputs.forEach((input) => {
    input.style.backgroundColor = "white";
    const val = input.value;
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
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>`;
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

    processes.push({
      PID: index + 1,
      arrivalTime: arrivalTime,
      burstTime: burstTime,
    });
  });
  console.log(processes);
  return processes;
}

// Render & calculate Table based on array with P objects
// Only AT, BT, ST, CT (Prio for special cases) needed

// Render Gantt chart based on array with "P" objects

// Code under here runs immediately
