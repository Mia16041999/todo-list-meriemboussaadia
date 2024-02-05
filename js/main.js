// Elements
const tasksList = document.querySelector("#tasks-list")
const addTaskForm = document.querySelector("form#add-task")
const addTaskInput = document.querySelector("#add-task-input")
const clearAllTasksBtn = document.querySelector("button#clear-all-tasks")

// Total List Of Tasks
let list = JSON.parse(localStorage.getItem("tasks")) || []

/**
 * Show All Tasks From Local Storage In Page
 */
function showTasksList() {
  tasksList.innerHTML = "";
 

  if (list.length === 0) {
    clearAllTasksBtn.disabled = true;

    const noTaskElement = `
      <div class="ui icon warning message">
        <i class="inbox icon"></i>
        <div class="content">
          <div class="header">You have nothing task today!</div>
          <p>Enter your tasks today above.</p>
        </div>
      </div>
    `;

    tasksList.style.border = "none";
    tasksList.insertAdjacentHTML("beforeend", noTaskElement);
    return;
  }

  clearAllTasksBtn.disabled = false;
  tasksList.style.border = "1px solid rgba(34,36,38,.15)";

  // Sort the tasks by priority
  list.sort((a, b) => {
    const priorityLevels = { high: 1, medium: 2, low: 3 };
    return priorityLevels[a.priority] - priorityLevels[b.priority];
  });

  list.forEach(task => {
    const priorityClass = `priority-${task.priority}`; // Use this for styling
    const priorityIndicator = task.priority ? `(${task.priority.toUpperCase()}) ` : ''; // Display the priority
    const taskElement = `
      <li class="ui segment grid equal width ${priorityClass}">
        <div class="ui checkbox column">
          <input type="checkbox" ${task.completed ? "checked" : ""} onclick="completeTask(${task.id})">
          <label>${priorityIndicator}${task.text}</label> <!-- Add the priority indicator here -->
        </div>
        <div class="column">
          <i data-id="${task.id}" class="edit outline icon"></i>
          <i data-id="${task.id}" class="trash alternate outline remove icon"></i>
        </div>
      </li>
    `;

    tasksList.insertAdjacentHTML("beforeend", taskElement);
  });

  // Add event listeners to the edit and trash icons
  document.querySelectorAll(`li i.edit`).forEach(item => {
    item.addEventListener("click", e => {
      e.stopPropagation();
      showEditModal(+e.target.dataset.id);
    });
  });


  document.querySelectorAll(`li i.trash`).forEach(item => {
    item.addEventListener("click", e => {
      e.stopPropagation();
      showRemoveModal(+e.target.dataset.id);
    });
  });
}


/**
 * Add new task to local storage
 */
function addTask(event) {
  event.preventDefault();
  const taskText = addTaskInput.value.trim();
  const taskPriority = document.querySelector("#add-task-priority").value;
  
  if (!taskText || !taskPriority) {
    // You can also show a notification to the user here if needed
    console.error("Task text or priority is not set.");
    return;
  }

  const newTask = {
    id: Date.now(), // Consider using Date.now() for a unique ID
    text: taskText,
    priority: taskPriority,
    completed: false,
  };

  list.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(list));
  addTaskInput.value = "";
  document.querySelector("#add-task-priority").value = "";

  showNotification("success", "Task was successfully added");
  showTasksList();
}


// Change Complete State
function completeTask(id) {
  // Get Task
  const taskIndex = list.findIndex(t => t.id == id)
  const task = list[taskIndex]

  // Change State
  task.completed = !task.completed
  list[taskIndex] = task

  // Save Changes
  localStorage.setItem("tasks", JSON.stringify(list))
  showTasksList()
}

/**
 * Remove task
 */
function removeTask(id) {
  list = list.filter(t => t.id !== id)
  localStorage.setItem("tasks", JSON.stringify(list))

  showNotification("error", "Task was successfully deleted")
  showTasksList()
}

/**
 * Edit task
 */
function editTask(id) {
  const taskText = document.querySelector("#task-text").value

  if (taskText.trim().length === 0) return
  const taskIndex = list.findIndex(t => t.id == id)

  list[taskIndex].text = taskText
  localStorage.setItem("tasks", JSON.stringify(list))

  showNotification("success", "Task was successfully updated")
  showTasksList()
}

// Clear All Tasks
function clearAllTasks() {
  if (list.length > 0) {
    list = []
    localStorage.setItem("tasks", JSON.stringify(list))
    return showTasksList()
  }

  new Noty({
    type: "error",
    text: '<i class="close icon"></i> There is no task to remove.',
    layout: "bottomRight",
    timeout: 2000,
    progressBar: true,
    closeWith: ["click"],
    theme: "metroui",
  }).show()
}

// Clear Complete Tasks
function clearCompleteTasks() {
  if (list.length > 0) {
    if (confirm("Are you sure?")) {
      const filteredTasks = list.filter(t => t.completed !== true)
      localStorage.setItem("tasks", JSON.stringify(filteredTasks))
      return showTasksList()
    }
  }

  Toastify({
    text: "There is no task to remove",
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "left",
    backgroundColor: "linear-gradient(to right, #e45757, #d44747)",
    stopOnFocus: true,
  }).showToast()
}

// Show Edit Modal And Pass Data
function showEditModal(id) {
  const taskIndex = list.findIndex(t => t.id == id)
  const { text } = list[taskIndex]

  document.querySelector("#edit-modal .content #task-id").value = id
  document.querySelector("#edit-modal .content #task-text").value = text.trim()
  document
    .querySelector("#update-button")
    .addEventListener("click", () => editTask(+id))

  $("#edit-modal.modal").modal("show")
}

// Show Remove Modal
function showRemoveModal(id) {
  document
    .querySelector("#remove-button")
    .addEventListener("click", () => removeTask(+id))

  $("#remove-modal.modal").modal("show")
}

// Show Clear All Tasks Modal
function showClearAllTasksModal() {
  if (list.length > 0) {
    return $("#clear-all-tasks-modal.modal").modal("show")
  }

  new Noty({
    type: "error",
    text: '<i class="close icon"></i> There is no task to remove.',
    layout: "bottomRight",
    timeout: 2000,
    progressBar: true,
    closeWith: ["click"],
    theme: "metroui",
  }).show()
}

function showNotification(type, text) {
  new Noty({
    type,
    text: `<i class="check icon"></i> ${text}`,
    layout: "bottomRight",
    timeout: 2000,
    progressBar: true,
    closeWith: ["click"],
    theme: "metroui",
  }).show()
}

// Event Listeners
addTaskForm.addEventListener("submit", addTask)
window.addEventListener("load", () => addTaskInput.focus())

showTasksList()
