import {
  resetColumns,
  verifyInputs,
  updateTableRows,
  resetInputs,
  showPriorityRows,
} from "./table.js";

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

// Event listener -> Algorithm
const selectAlgorithmBtn = document.getElementById("algorithm");
selectAlgorithmBtn.addEventListener("change", () => {
  // reset all columns
  resetColumns();

  // Special cases: Priority, Deadline, MLQ
  if (selectAlgorithmBtn.value == "priority") {
    showPriorityRows();
  } else if (selectAlgorithmBtn.value == "dealdine") {
    // add table changes here
  } else if (selectAlgorithmBtn.value == "mlq") {
    // add table changes here
  }
});

// Event listener -> Process number
const selectProcessBtn = document.getElementById("processnum");
selectProcessBtn.addEventListener("change", () => {
  // check for input changes
  updateInputVariables();

  // remove invalid error messages
  resetInputs();

  // check dropdowns first
  updateTableRows(algoType, numOfProcesses);
});

// Event listener -> Calculate button
const calculateBtn = document.getElementById("calculate-btn");
calculateBtn.addEventListener("click", () => {
  console.log("calculate!");

  // get updated inputs
  updateInputVariables();

  // verify if all inputs are filled correctly
  verifyInputs();

  // get data from table
  getProcessData();
});

// Var for the table body to append rows to
const tableMain = document.querySelector(".row-container");

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
    let priorityTime = 0;

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
