const tableMain = document.querySelector(".row-container");

// Helper function to reset hidden columns
export function resetColumns() {
  const avePrioRow = document.querySelector(".priority-ave");
  const priorityHeader = document.querySelector(".priority-header");
  const priorityColumns = document.querySelectorAll(
    ".data-table .priority-time"
  );

  resetInputs();

  avePrioRow.classList.add("hide");
  priorityHeader.classList.add("hide");
  priorityColumns.forEach((row) => {
    if (!row.classList.contains("hide")) {
      row.classList.add("hide");
    }
  });
}

const errorDisplay = document.querySelector(".error-msg");
let hasError = false; // for table
// check if inputs are wrong or empty
export function verifyInputs() {
  const allInputs = tableMain.querySelectorAll("input");

  hasError = false;
  errorDisplay.textContent = "";

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

  if (hasError) {
    errorDisplay.textContent = "Invalid Inputs";
  }
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
                  <td class="priority-time hide">
                    <input pattern="[0-9]*" />
                  </td>
                  <td class="start-time"></td>
                  <td class="completion-time"></td>
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
