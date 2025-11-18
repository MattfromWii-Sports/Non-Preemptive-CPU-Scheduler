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

// Event listeners
const selectProcessBtn = document.getElementById("processnum");
selectProcessBtn.addEventListener("click", () => {
  // check for input changes
  updateInputVariables();

  // check dropdowns first
  updateTableRows();
});

const calculateBtn = document.getElementById("calculate-btn");
calculateBtn.addEventListener("click", () => {
  console.log("calculate!");

  // verify if all inputs are filled correctly
  verifyInputs();
});

// Var for the table body to append rows to
const tableMain = document.querySelector(".row-container");

// check if inputs are worng or empty
function verifyInputs() {
  const allInputs = tableMain.querySelectorAll("input");
  allInputs.forEach((input) => {
    const val = input.value;
    if (val == "" || !/^\d+$/.test(val)) {
      input.style.backgroundColor = "#ffcccc";
      console.log(3243);
    }
  });
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
      tableMain.insertBefore(newRow, lastRow);
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

// Render & calculate Table based on array with P objects
// Only AT, BT, ST, CT (Prio for special cases) needed

// Render Gantt chart based on array with "P" objects

// Code under here runs immediately
