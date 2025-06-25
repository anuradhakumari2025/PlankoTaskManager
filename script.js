let teamMembers = ["Anuradha", "Rohan", "Priya"];

// Populate form select (multiple)
const formAssigneeSelect = document.querySelector("#formAssignee");
formAssigneeSelect.innerHTML = ""; // clear existing options
teamMembers.forEach((member) => {
  const option = document.createElement("option");
  option.value = member.toLowerCase();
  option.textContent = member;
  formAssigneeSelect.appendChild(option);
});

// Populate filter select (single)
const filterAssigneeSelect = document.querySelector("#filterAssignee");
filterAssigneeSelect.innerHTML = '<option value="">All</option>';
teamMembers.forEach((member) => {
  const option = document.createElement("option");
  option.value = member.toLowerCase();
  option.textContent = member;
  filterAssigneeSelect.appendChild(option);
});

const filterIcon = document.querySelector(".filterIcon");
const filterDiv = document.querySelector(".filter-panel");
const addTaskPopup = document.querySelector(".addTaskPopup");
const cancelBtn = document.querySelector(".addTaskPopup form .cancel");
const closeIcon  = document.querySelector(".addTaskPopup form .close")
const form = document.querySelector(".addTaskPopup form");
const addTaskBtns = document.querySelectorAll(".addTaskBtn");
const todoTaskContainer = document.querySelector(
  ".view1 main .bottom .todo .todoTasks"
);
const inProgressTaskContainer = document.querySelector(
  ".view1 main .bottom .todo .taskInProgress"
);
const doneTaskContainer = document.querySelector(".view1 main .bottom .todo .taskDone");
const columns = [todoTaskContainer, inProgressTaskContainer, doneTaskContainer];

//Form div open when add  button clicked
for (let i = 0; i < addTaskBtns.length; i++) {
  addTaskBtns[i].addEventListener("click", () => {
    addTaskPopup.style.display = "flex";
  });
}

//Open filter div
let isOpen = false;
filterIcon.addEventListener("click", (e) => {
  if (!isOpen) {
    filterDiv.style.display = "flex";
    // console.log(true)
    isOpen = true;
  } else {
    filterDiv.style.display = "none";
    isOpen = false;
  }
});

let isEdit = false;
let taskBeingEdited = null;
let draggedTask = null;

//For drag and drop of task from one column to other
columns.forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault(); // allows drop
    col.style.backgroundColor = "#f8d7da"; // optional effect
  });

  col.addEventListener("dragleave", () => {
    col.style.backgroundColor = ""; // reset
  });

  col.addEventListener("drop", (e) => {
    e.preventDefault();

    if (draggedTask) {
      col.appendChild(draggedTask);
      col.style.backgroundColor = "";

       // Get status from data attribute
      const statusValue = col.getAttribute("data-status");

      // Update status text inside the task card
      draggedTask.querySelector(
        "p:last-of-type"
      ).innerHTML = `<span>Status: </span>${statusValue}`;

      // --- Update status in taskList and localStorage ---
      // Find the task in taskList by id
      const taskId = draggedTask.id;
      // const statusValue =
      //   statusText === "Todo"
      //     ? "todo"
      //     : statusText === "In Progress"
      //     ? "in-progress"
      //     : statusText === "Done"
      //     ? "done"
      //     : "";

      const index = taskList.findIndex((t) => t.id === taskId);
      if (index !== -1 && statusValue) {
        taskList[index].status = statusValue;
        localStorage.setItem("tasks", JSON.stringify(taskList));
      }
    }
  });
});

// Get selected filter values
const statusFilter = document.getElementById("filterStatus");
const priorityFilter = document.getElementById("filterPriority");
const assigneeFilter = document.getElementById("filterAssignee");
const dueDateFilter = document.getElementById("filterDueDate");

let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
renderTasks(taskList);

//Create Task Card function
function createTaskCard(taskObj) {
  const task = document.createElement("div");
  task.setAttribute("draggable", "true");
  task.classList.add("todoTask");

  // Convert array of assignees to comma-separated string for display
  const assigneeDisplay = Array.isArray(taskObj.assignee)
    ? taskObj.assignee.join(", ")
    : taskObj.assignee;

  task.innerHTML = `
    <h4>${taskObj.title}</h4>
    <p><span>Due Date: </span>${taskObj.date}</p>
    <p><span>Task: </span>${taskObj.description}</p>
    <p><span>Assignee: </span>${assigneeDisplay}</p>
    <p><span>Priority: </span>${taskObj.priority}</p>
    <p><span>Status: </span>${taskObj.status}</p>
    <button class="editBtn"><i class="ri-edit-2-fill"></i></button>
  `;
  task.id = taskObj.id;

  // Drag events
  task.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    draggedTask = task;
  });
  task.addEventListener("dragend", () => {
    draggedTask = null;
  });

  // Edit button event
  const editBtn = task.querySelector(".editBtn");
  editBtn.addEventListener("click", () => {
    isEdit = true;
    taskBeingEdited = task;

    form.title.value = task.querySelector("h3").textContent;
    form.date.value = task
      .querySelector("p:nth-of-type(1)")
      .textContent.replace("Due Date:", "");
    form.desc.value = task
      .querySelector("p:nth-of-type(2)")
      .textContent.replace("Task: ", "");

    // Set multiple selected values for assignees
    const assigneesText = task
      .querySelector("p:nth-of-type(3)")
      .textContent.replace("Assignee: ", "")
      .trim();
    const selectedAssignees = assigneesText
      .split(",")
      .map((name) => name.trim().toLowerCase());
    const assigneeSelect = form.querySelector('select[name="formAssignee"]');

    Array.from(assigneeSelect.options).forEach((option) => {
      option.selected = selectedAssignees.includes(option.value.toLowerCase());
    });

    form.priority.value = task
      .querySelector("p:nth-of-type(4)")
      .textContent.replace("Priority: ", "");
    form.status.value = task
      .querySelector("p:nth-of-type(5)")
      .textContent.replace("Status: ", "");

    addTaskPopup.style.display = "flex";
  });

  return task;
}

//Form for add or edit of task
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = form.title.value;
  const date = form.date.value;
  const description = form.desc.value;
  const priority = form.priority.value;
  // const assignee = form.assignee.value;
  // Get selected assignees (MULTIPLE)
  const assigneeSelect = form.querySelector('select[name="formAssignee"]');
  const assignee = Array.from(assigneeSelect.selectedOptions).map(
    (opt) => opt.value
  );
  // console.log(assignee);
  const status = form.status.value;

  let taskObj = {
    // id: "task-" + Date.now(),
    title: title,
    date: date,
    description: description,
    assignee: assignee, //array
    priority: priority,
    status: status,
  };
  // taskList.push(taskObj);

  if (isEdit && taskBeingEdited) {
    // Use the old id for the updated object
    taskObj.id = taskBeingEdited.id;

    // UPDATE existing task
    taskBeingEdited.querySelector("h3").textContent = title;
    taskBeingEdited.querySelector(
      "p:nth-of-type(1)"
    ).innerHTML = `<span>Due Date: </span>${date}`;
    taskBeingEdited.querySelector(
      "p:nth-of-type(2)"
    ).innerHTML = `<span>Task: </span>${description}`;
    taskBeingEdited.querySelector(
      "p:nth-of-type(3)"
    ).innerHTML = `<span>Assignee: </span>${assignee.join(",")}`;
    taskBeingEdited.querySelector(
      "p:nth-of-type(4)"
    ).innerHTML = `<span>Priority: </span>${priority}`;
    taskBeingEdited.querySelector(
      "p:nth-of-type(5)"
    ).innerHTML = `<span>Status: </span>${status}`;

    if (status === "todo") {
      todoTaskContainer.appendChild(taskBeingEdited);
    } else if (status == "in-progress") {
      inProgressTaskContainer.appendChild(taskBeingEdited);
    } else {
      doneTaskContainer.appendChild(taskBeingEdited);
    }

    // Update the existing task in taskList
    const index = taskList.findIndex((t) => t.id === taskBeingEdited.id);
    if (index !== -1) {
      taskList[index] = taskObj; // Replace task
    }

    isEdit = false;
    taskBeingEdited = null;
  } else {
    // CREATE a new task
    // For new tasks, generate a new id
    taskObj.id = "task-" + Date.now();
    const task = createTaskCard(taskObj);

    if (status === "todo") {
      todoTaskContainer.appendChild(task);
    } else if (status == "in-progress") {
      inProgressTaskContainer.appendChild(task);
    } else {
      doneTaskContainer.appendChild(task);
    }

    taskList.push(taskObj); // Add new task
  }

  console.log(taskList, "Tasklist");

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTasks(taskList);

  // Reset + hide form
  form.reset();
  addTaskPopup.style.display = "none";
});

cancelBtn.addEventListener("click", (e) => {
  addTaskPopup.style.display = "none";
});
closeIcon.addEventListener("click",()=>{
  addTaskPopup.style.display = "none"
})

//Apply filter property
statusFilter.addEventListener("change", applyFilters);
priorityFilter.addEventListener("change", applyFilters);
assigneeFilter.addEventListener("change", applyFilters);
dueDateFilter.addEventListener("change", applyFilters);

function applyFilters() {
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;
  const selectedAssignee = assigneeFilter.value;
  const selectedDueDate = dueDateFilter.value;

  const filteredTasks = taskList.filter((task) => {
    const matchStatus = selectedStatus ? task.status === selectedStatus : true;
    const matchPriority = selectedPriority
      ? task.priority === selectedPriority
      : true;

    // Assignee check: if task.assignee is an array, check if it includes the selectedAssignee
    const matchAssignee = selectedAssignee
      ? Array.isArray(task.assignee)
        ? task.assignee.includes(selectedAssignee)
        : task.assignee === selectedAssignee
      : true;

    const matchDueDate = selectedDueDate ? task.date === selectedDueDate : true;

    return matchStatus && matchPriority && matchAssignee && matchDueDate;
  });

  renderTasks(filteredTasks);
}

function renderTasks(tasks) {
  const taskContainers = {
    todo: todoTaskContainer,
    "in-progress": inProgressTaskContainer,
    done: doneTaskContainer,
  };

  // Clear previous task cards
  Object.values(taskContainers).forEach((container) => {
    container.innerHTML = "";
  });

  tasks.forEach((task) => {
    if (!taskContainers[task.status]) {
      console.log("Unknown status:", task.status, task);
      return;
    }

    const statusMatch =
      !statusFilter.value || task.status === statusFilter.value;
    const priorityMatch =
      !priorityFilter.value || task.priority === priorityFilter.value;

    // Updated: support multiple assignees in an array
    const assigneeMatch =
      !assigneeFilter.value ||
      (Array.isArray(task.assignee)
        ? task.assignee
            .map((a) => a.toLowerCase())
            .includes(assigneeFilter.value.toLowerCase())
        : task.assignee.toLowerCase() === assigneeFilter.value.toLowerCase());

    const dueDateMatch =
      !dueDateFilter.value || task.date === dueDateFilter.value;

    if (statusMatch && priorityMatch && assigneeMatch && dueDateMatch) {
      const taskCard = createTaskCard(task);
      taskContainers[task.status].appendChild(taskCard);
    }
  });
}
