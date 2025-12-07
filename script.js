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
  showDeadlineRows,
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
  } else if (selectAlgorithmBtn.value == "deadline") {
    showDeadlineRows();
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
  updateSubQueueAlgorithms();
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

// Event Listener for the MLQ subqueues
// Note showMLQRows already handles the columns to be displayed like priority
const subQueue1 = document.getElementById("subQueue1");
const subQueue2 = document.getElementById("subQueue2");
subQueue1.addEventListener("change", () => {
  resetColumns();
  showMLQRows();
});
subQueue2.addEventListener("change", () => {
  resetColumns();
  showMLQRows();
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

    const deadline_input = row.querySelector(".deadline-time input");
    let deadlineTime = 0;

    const queue_input = row.querySelector(".queue-num input");
    let queueNum = 0;

    // for priority algo
    if (algoType == "priority") {
      priorityTime = parseInt(priority_input.value) || 0;
    } else if (algoType == "mlq") {
      priorityTime = parseInt(priority_input.value) || 0;
      queueNum = parseInt(queue_input.value) || 0;
    } else if (algoType == "deadline") {
      deadlineTime = parseInt(deadline_input.value) || 0;
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
      deadline: deadlineTime,
      lateness: null,
      tardiness: null,
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
      deadlineAlgorithm(process);
      break;
    case "mlq":
      console.log("mlq!");
      mlqAlgorithm(process, algoSQ1, algoSQ2);

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
  const processSize = process.length; // Stores the number of processes
  let currentTime = 0; // Current running time (Gantt Chart)
  let completedCount = 0; // How many processes are completed

  process.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sorts the arrival time in ascending

  ganttChart = [];

  // Loops through all the processes
  while (completedCount < processSize) {
    const runningProcess = process[completedCount]; // Selects the next process as indicated by process[completedCount]

    // If arrivalTime is higher than current time, CPU idle
    if (runningProcess.arrivalTime > currentTime) {
      currentTime = runningProcess.arrivalTime;
    }

    runningProcess.startTime = currentTime;
    runningProcess.completionTime = currentTime + runningProcess.burstTime;
    currentTime = runningProcess.completionTime; // Next process

    ganttChart.push(runningProcess);
    completedCount++;
  }
}

//**************************************************************************************************** */

//Important Variables for Sub Queues
let algoSQ1 = "fcfs"; //default val
let algoSQ2 = "fcfs"; //default val

//Function to update the subqueues
function updateSubQueueAlgorithms() {
  let subAlgorithm1 = document.getElementById("subQueue1");
  let subAlgorithm2 = document.getElementById("subQueue2");

  algoSQ1 = subAlgorithm1.value;
  algoSQ2 = subAlgorithm2.value;
}

let mlqRunningQueue = [];
let globaltime = 0;
let mlqCurrentTime = 0;

//MLQ Algorithm
function mlqAlgorithm(process, subQueue1, subQueue2) {
  //Sort processes by arrival time
  process = sortProcessByAT(process);
  console.log("Prio:");
  console.log(process);

  //reset
  ganttChart = [];
  mlqRunningQueue = [];
  globaltime = 0;
  mlqCurrentTime = 0; //Time for FCFS and SJF

  //sub Queues
  let Queue1 = [];
  let Queue2 = [];

  //Insert all process according to their Queue Number
  for (
    let selectedProcess = 0;
    selectedProcess < process.length;
    selectedProcess++
  ) {
    //Insert based on Queue Number
    switch (process[selectedProcess].queueNum) {
      case 1:
        Queue1.push(process[selectedProcess]);
        break;
      case 2:
        Queue2.push(process[selectedProcess]);
        break;
    }
  }

  //Add the earliest arrival time of the PID
  globaltime += process[0].arrivalTime;

  let anyProcessed; // This variable is used to check if any of the processes were inserted in this while loop

  //This is where the processing begins.
  while (Queue1.length !== 0 || Queue2.length !== 0) {
    anyProcessed = false;

    mlqCurrentTime = globaltime; //Current time without adding the BT

    //Insert all the applicable process of Queue1
    while (Queue1.length > 0 && Queue1[0].arrivalTime <= globaltime) {
      globaltime += Queue1[0].burstTime;
      mlqRunningQueue.push(Queue1.shift());
      anyProcessed = true;
    }

    //Execute the current running process
    if (mlqRunningQueue.length > 0) {
      switch (subQueue1) {
        case "fcfs":
          mlqFCFS(mlqRunningQueue);
          break;
        case "sjf":
          mlqSJF(mlqRunningQueue);
          break;
        case "priority":
          mlqPriority(mlqRunningQueue, mlqCurrentTime);
          break;
      }
    }

    //Clear mlqRunningQueue
    mlqRunningQueue = [];

    mlqCurrentTime = globaltime; //Current time without adding the BT

    //Insert all the applicable process of Queue2
    while (Queue2.length > 0 && Queue2[0].arrivalTime <= globaltime) {
      globaltime += Queue2[0].burstTime;
      mlqRunningQueue.push(Queue2.shift());
      anyProcessed = true;
    }

    //Execute the current running process
    if (mlqRunningQueue.length > 0) {
      switch (subQueue2) {
        case "fcfs":
          mlqFCFS(mlqRunningQueue);
          break;
        case "sjf":
          mlqSJF(mlqRunningQueue);
          break;
        case "priority":
          mlqPriority(mlqRunningQueue, mlqCurrentTime);
          break;
      }
    }

    //Clear mlqRunningQueue
    mlqRunningQueue = [];

    if (anyProcessed === false) {
      globaltime += 1;
    }
  }
}

//MLQ FCFS
function mlqFCFS(process) {
  const processSize = process.length;
  let completedCount = 0;

  process.sort((a, b) => a.arrivalTime - b.arrivalTime);

  while (completedCount < processSize) {
    const runningProcess = process[completedCount];

    if (runningProcess.arrivalTime > mlqCurrentTime) {
      mlqCurrentTime = runningProcess.arrivalTime;
    }

    runningProcess.startTime = mlqCurrentTime;
    runningProcess.completionTime = mlqCurrentTime + runningProcess.burstTime;
    mlqCurrentTime = runningProcess.completionTime;

    ganttChart.push(runningProcess);
    completedCount++;
  }
}

//MLQ SJF
function mlqSJF(process) {
  const processSize = process.length; // to be used to check all inputted processes
  let completedCount = 0;

  process.sort((a, b) => a.arrivalTime - b.arrivalTime);

  // console.log(completed);

  // LOOP THROUGH ALL PROCESSES
  while (completedCount < processSize) {
    let processindex = -1; // NO PROCESS YET; USED TO TRACK CURRENT PROCESS
    let minburstTime = Infinity; // INFINITY TO ENSURE THAT THIS IS THE HIGHEST VALUE POSSIBLE

    // CHECK AND SORT EACH PROCESSES
    for (let i = 0; i < processSize; i++) {
      //CHECK IF ARRIVAL TIME IS ALREADY WITHIN CURRENT TIME & IF IT IS NOT YET COMPLETE
      if (
        process[i].arrivalTime <= mlqCurrentTime &&
        !process[i].completionTime
      ) {
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
        mlqCurrentTime = nextArrivalTime;
      }
      continue;
    }

    const runningProcess = process[processindex];
    runningProcess.startTime = mlqCurrentTime;
    runningProcess.completionTime = mlqCurrentTime + runningProcess.burstTime;
    mlqCurrentTime = runningProcess.completionTime;
    ganttChart.push(runningProcess);

    completedCount++;
  }
}

//MLQ Priority
function mlqPriority(process, currentRunningTime) {
  let readyQ = []; // for processes that already arrived at time AT
  let currentAt = currentRunningTime;

  console.log("currentAt:" + currentAt);

  // sort the processes by AT
  const sortedProcess = sortProcessByAT(process);

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
}

// Deadline Algo
function deadlineAlgorithm(process) {
  ganttChart = []; // reset gantt chart
  let readyQ = []; // for processes that already arrived at time AT
  let currentAt = 0;

  // sort the processes by AT
  const sortedProcess = sortProcessByAT(process);
  currentAt = sortedProcess[0].arrivalTime;

  while (readyQ.length > 0 || sortedProcess.length > 0) {
    // get the first processes = lowest AT & deadline
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

    // sort for deadline  -> first child is the lowest priority & first position
    readyQ = sortProcessByDeadline(readyQ);

    const runningProcess = readyQ.shift();

    // 4. Calculate and record the times
    // The process starts when the CPU is currently available
    runningProcess.startTime = currentAt;

    // CT = Start Time + BT
    runningProcess.completionTime = currentAt + runningProcess.burstTime;

    // Lateness = CT - Deadline
    runningProcess.lateness =
      runningProcess.completionTime - runningProcess.deadline;

    // Tardiness
    if (runningProcess.lateness <= 0) {
      runningProcess.tardiness = 0;
    } else {
      runningProcess.tardiness = runningProcess.lateness;
    }

    // Update the CPU time to the time the running process finishes
    currentAt = runningProcess.completionTime;

    // 5. Push completed process to  Gantt Chart
    ganttChart.push(runningProcess);
  }
  console.log("gantt");
  console.log(ganttChart);
}

function sortProcessByDeadline(d) {
  const sortedProcess = d.sort((a, b) => {
    // sort by arrival time
    if (a.deadline !== b.deadline) {
      return a.deadline - b.deadline;
    }

    //Tie-breaker: first entered order)
    return a.PID - b.PID;
  });
  return sortedProcess;
}
