import {
  resetColumns,
  verifyInputs,
  updateTableRows,
  resetInputs,
  showPriorityRows,
  showMLQRows,
  displayTable,
  calculateValues,
  clearTableCalculations,
  displayGanttChart,
  clearGanttChart,
} from "./table.js";

// Important input variables
let numOfProcesses = 2; // default val
let algoType = "fcfs"; // default val
let processTable = null; // stores all the values
let ganttChart = []; // stores final values

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
  // remove all calculated values from previous algos
  clearTableCalculations();
  clearGanttChart();
  // reset all columns
  resetColumns();

  // Special cases: Priority, Deadline, MLQ
  if (selectAlgorithmBtn.value == "priority") {
    showPriorityRows();
  } else if (selectAlgorithmBtn.value == "dealdine") {
    // add table changes here
  } else if (selectAlgorithmBtn.value == "mlq") {
    showMLQRows();
  }
});

// Event listener -> Process number
const selectProcessBtn = document.getElementById("processnum");
selectProcessBtn.addEventListener("change", () => {
  // remove old gantt chart first
  clearTableCalculations();
  clearGanttChart();

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
  // clear gantt chart
  clearGanttChart();

  // verify if all inputs are filled correctly
  if (verifyInputs()) {
    return; // stop running if inputs are invalid
  }

  // get data from table
  processTable = getProcessData();

  // process the processTable
  calculateTable(algoType, processTable);

  // calculate tat, wt, rt to the chart first
  calculateValues(ganttChart);
  // display the calculated table
  displayTable(ganttChart);
  displayGanttChart(ganttChart);
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

    const queue_input = row.querySelector(".queue-num input");
    let queueNum = 0;

    // for priority algo
    if (algoType == "priority") {
      priorityTime = parseInt(priority_input.value) || 0;
    } else if (algoType == "mlq") {
      queueNum = parseInt(queue_input.value) || 0;
    }

    processes.push({
      PID: index + 1,
      arrivalTime: arrivalTime,
      burstTime: burstTime,
      priority: priorityTime, // 0 if not used
      queueNum: queueNum,
      startTime: null,
      completionTime: null,
      turnaroundTime: null,
      waitingTime: null,
      responseTime: null,
    });
  });
  console.log(processes); // for testing
  return processes;
}

// to calculate the st and ct
function calculateTable(algo, process) {
  switch (algo) {
    case "fcfs":
      console.log("fcfs!");
      fcfsAlgorithm(process);
      break;
    case "sjf":
      console.log("sjf!");
      sjfAlgorithm(process);
      break;
    case "priority":
      console.log("priority!");
      priorityAlgorithm(process);
      break;
    case "deadline":
      console.log("deadline!");
      break;
    case "mlq":
      console.log("mlq!");
      break;
  }
}

// Algorithms

// PRIORITY ALGORITHM
function priorityAlgorithm(process) {
  ganttChart = []; // reset gantt chart
  let readyQ = []; // for processes that already arrived at time AT
  let currentAt = 0;

  // sort the processes by AT
  const sortedProcess = sortProcessByAT(process);
  currentAt = sortedProcess[0].arrivalTime;

  // console.log(sortedProcess);

  while (readyQ.length > 0 || sortedProcess.length > 0) {
    // get the first processes = lowest AT & Priority
    // get all processes that arrived before or during time AT
    while (
      sortedProcess.length !== 0 &&
      sortedProcess[0].arrivalTime <= currentAt
    ) {
      readyQ.push(sortedProcess.shift());
    }

    // --- Handling CPU Idle Time (if Ready Queue is empty) ---
    if (readyQ.length === 0 && sortedProcess.length > 0) {
      // If the CPU is idle, advance currentTime to the arrival time of the next process
      currentAt = sortedProcess[0].arrivalTime;
      // Now re-run the arrival check loop to populate the ready queue
      continue;
    }

    // sort for priority -> first child is the lowest priority & first position
    readyQ = sortProcessByP(readyQ);

    const runningProcess = readyQ.shift();

    // 4. Calculate and record the times

    // The process starts when the CPU is currently available
    runningProcess.startTime = currentAt;

    // CT = Start Time + BT
    runningProcess.completionTime = currentAt + runningProcess.burstTime;

    // Update the CPU time to the time the running process finishes
    currentAt = runningProcess.completionTime;

    // 5. Push completed process to  Gantt Chart
    ganttChart.push(runningProcess);
  }
  console.log("gantt");
  console.log(ganttChart);
}

// helper function to sort processes by at
function sortProcessByAT(p) {
  const sortedProcess = p.sort((a, b) => {
    // sort by arrival time
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }

    //Tie-breaker: first entered order)
    return a.PID - b.PID;
  });
  return sortedProcess;
}
// helper function to sort processes by priority
function sortProcessByP(p) {
  const sortedProcess = p.sort((a, b) => {
    // sort by arrival time
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    //Tie-breaker: first entered order)
    return a.PID - b.PID;
  });
  return sortedProcess;
}

// SJF ALGORITHM
function sjfAlgorithm(process) {
  const processSize = process.length; // to be used to check all inputted processes
  let currentTime = 0;
  let completedCount = 0;

  process.sort((a, b) => a.arrivalTime - b.arrivalTime);

  ganttChart = [];
  // console.log(completed);

  // LOOP THROUGH ALL PROCESSES
  while (completedCount < processSize) {
    let processindex = -1; // NO PROCESS YET; USED TO TRACK CURRENT PROCESS
    let minburstTime = Infinity; // INFINITY TO ENSURE THAT THIS IS THE HIGHEST VALUE POSSIBLE

    // CHECK AND SORT EACH PROCESSES
    for (let i = 0; i < processSize; i++) {
      //CHECK IF ARRIVAL TIME IS ALREADY WITHIN CURRENT TIME & IF IT IS NOT YET COMPLETE
      if (process[i].arrivalTime <= currentTime && !process[i].completionTime) {
        // COMPARES AND SORTS BURSTTIME OF CURRENT PROCESS TO INFINITY (WHICH IS AUTOMATICALLY TRUE); TRUE = CHANGE BT VALUE
        if (process[i].burstTime < minburstTime) {
          minburstTime = process[i].burstTime; // NEW VALUE TO BE COMPARED TO THE NEXT BURST TIME
          processindex = i;
        }
      }
    }
    // CPU IDLE
    // CHECKS IF THERE IS NO RUNNING PROCESS CURRENTLY
    if (processindex === -1) {
      let nextArrivalTime = Infinity; // USE THE LARGEST NUMBER AVAILABLE
      for (let i = 0; i < processSize; i++) {
        if (!process[i].completionTime) {
          nextArrivalTime = Math.min(nextArrivalTime, process[i].arrivalTime); // RETURNS SMALLER VALUE
        }
      }

      // GET THE VALUE OF THE NEXT ARRIVAL TIME AS THE NEW CURRENT TIME
      if (nextArrivalTime !== Infinity) {
        currentTime = nextArrivalTime;
      }
      continue;
    }

    const runningProcess = process[processindex];
    runningProcess.startTime = currentTime;
    runningProcess.completionTime = currentTime + runningProcess.burstTime;
    currentTime = runningProcess.completionTime;
    ganttChart.push(runningProcess);

    completedCount++;
  }
}

// FCFS ALGORITHM
function fcfsAlgorithm(process) {
  const processSize = process.length;
  let currentTime = 0;
  let completedCount = 0;

  process.sort((a, b) => a.arrivalTime - b.arrivalTime);

  ganttChart = [];

  while (completedCount < processSize) {
    const runningProcess = process[completedCount];

    if (runningProcess.arrivalTime > currentTime) {
      currentTime = runningProcess.arrivalTime;
    }

    runningProcess.startTime = currentTime;
    runningProcess.completionTime = currentTime + runningProcess.burstTime;
    currentTime = runningProcess.completionTime;

    ganttChart.push(runningProcess);
    completedCount++;
  }
}
