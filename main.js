/* Dom elements selection */
// Form elements
const todoForm = document.querySelector("#app header .todo-form");
const searchBar = document.querySelector("#app header .search-form input");

// Todos container div
const todosContainer = document.getElementById("todos-container");

// To-do's options buttons
const deleteAllBtn = document.querySelector("#todos .delete-all");
const themeBtn = document.querySelector("#todos .header-btns .theme-btn");

// To-do's array
let todos = [];

// Searched To-do's
let searchedTodos = [];

// Priority options
const priorityOptions = ["high", "medium", "low", "none"];

/* Event listeners */
window.addEventListener("load", () => {
  // Get theme from local storage
  getThemeFromLocalStorage();
  // Get todos from local storage and renders them
  showTodos();
  // Check if todos are overflowing
  checkTodosOverflow();
});

window.addEventListener("resize", checkTodosOverflow);

todosContainer.addEventListener("scroll", updateIndicator);

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo();
  // Rerender todos
  updateTodos();
});

themeBtn.addEventListener("click", () => {
  const root = document.documentElement;
  const theme = root.getAttribute("data-theme");
  // Change theme
  if (theme === "dark") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", "dark");
  }

  // Change theme btn icon
  if (themeBtn.className.includes("light")) {
    themeBtn.classList.remove("light");
    themeBtn.classList.add("dark");
  } else {
    themeBtn.classList.remove("dark");
    themeBtn.classList.add("light");
  }
  localStorage.setItem("theme", root.getAttribute("data-theme"));
});

searchBar.addEventListener("input", (e) => {
  const searchQuery = e.target.value.trim();
  if (searchQuery.length > 0) {
    searchTodos(searchQuery);
  } else {
    searchedTodos = [];
    showTodos();
  }
});

deleteAllBtn.addEventListener("click", showDeleteAllConfirmation);

/* Functions */
// Ui rendering functions
function showTodos() {
  getDataFromLocalStorage();
  todosContainer.innerHTML = "";
  if (todos.length) {
    // Show delete all button
    deleteAllBtn.classList.add("show");
    // Add all todos
    renderTodosList(todos);
  } else {
    // Hide delete-all button
    deleteAllBtn.classList.remove("show");
    noTodosToShow();
  }
}

function showSearchResults() {
  todosContainer.innerHTML = "";
  deleteAllBtn.classList.remove("show");
  if (searchedTodos.length) {
    renderTodosList(searchedTodos);
  } else {
    noTodosToShow();
  }
}

function searchTodos(query) {
  searchedTodos = todos.filter((todo) => {
    const regex = new RegExp(query, "i");
    return regex.test(todo.text);
  });
  showSearchResults();
}

function renderTodosList(listOfTodos) {
  for (let todo of listOfTodos) {
    // Creating the todo container
    const todoContainer = newElement("div", {
      id: todo.id,
      class: `todo ${todo.priority} ${todo.checked ? "checked" : ""}`,
    });

    // Creating the todo content container
    const todoContent = newElement("div", { class: "todo-content" });
    const checkBox = newElement("div", { class: "check-box" });
    checkBox.addEventListener("click", (e) => checkTodo(todo.id, todo.checked));
    const todoText = newElement("p", {
      class: "todo-text",
      textContent: todo.text,
    });
    appendChildren(todoContent, [checkBox, todoText]);

    // Creating the todo-options div
    const optionsContainer = newElement("div", { class: "todo-options" });
    const optionsButtonIcon = newElement("i", {
      class: "fa-solid fa-ellipsis",
    });
    const optionsButtonInSmallScreens = newElement(
      "button",
      {
        class: "sm-todo-options-btn btn",
      },
      optionsButtonIcon
    );
    optionsButtonInSmallScreens.addEventListener("click", () => {
      toggleTodoOptionsInSmScreens(optionsContainer);
    });

    // Edit Todo button
    const editIcon = newElement("i", { class: "fa-solid fa-edit" });
    const editBtn = newElement(
      "button",
      { class: "edit-btn btn", "data-tooltip": "Edit" },
      editIcon
    );
    editBtn.addEventListener("click", () => {
      showEditForm(todo.id, todo.text);
      toggleTodoOptionsInSmScreens(optionsContainer);
    });

    // Todo Priority select menu
    const prioritySelect = newElement("select", {
      class: "select-menu",
    });
    for (let option of priorityOptions) {
      const optionElement = newElement("option", {
        class: "option",
        value: option,
        textContent: option,
      });
      optionElement.selected = option === todo.priority;
      prioritySelect.appendChild(optionElement);
    }
    prioritySelect.addEventListener("change", (event) => {
      changePriority(todo.id, event.target.value);
    });

    // Delete Todo button
    const deleteIcon = newElement("i", { class: "fa-solid fa-delete-left" });
    const deleteBtn = newElement(
      "button",
      { class: "delete-btn btn", tooltip: "Delete" },
      deleteIcon
    );
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    // Append the buttons to the options container
    if (!todo.checked) {
      appendChildren(optionsContainer, [prioritySelect, editBtn]);
    }
    optionsContainer.appendChild(deleteBtn);

    // Append the options to the todo container
    appendChildren(todoContainer, [
      todoContent,
      optionsButtonInSmallScreens,
      optionsContainer,
    ]);

    // Add the todo to the HTML page
    todosContainer.prepend(todoContainer);
  }
}

function noTodosToShow() {
  const noTodosContainer = newElement("div", { id: "no-todos" });
  const noTodosHeader = newElement("div", {
    id: "no-todos-header",
    textContent: "No To-do's to show",
  });
  const noTodosIllustration = newElement("img", {
    id: "no-todos-illustration",
    src: "./imgs/empty-illustration.svg",
  });
  appendChildren(noTodosContainer, [noTodosIllustration, noTodosHeader]);
  todosContainer.appendChild(noTodosContainer);
}

function stopSearching() {
  searchBar.value = "";
}

function toggleTodoOptionsInSmScreens(element) {
  const todoEls = todosContainer.children;
  if (!element.className.includes("show")) {
    for (let todo of todoEls) {
      const todoOptions = todo.querySelector(".todo-options");
      if (todoOptions.className.includes("show"))
        todoOptions.classList.remove("show");
    }
    element.classList.add("show");
  } else {
    element.classList.remove("show");
  }
}

function checkTodosOverflow() {
  const overflowIndicator = document.getElementById("overflow-indicator");

  // Check if content is overflowing
  const isOverflowing =
    todosContainer.scrollHeight > todosContainer.clientHeight;

  // Show or hide the overflow indicator
  if (isOverflowing) {
    overflowIndicator.classList.add("show");
  } else {
    overflowIndicator.classList.remove("show");
  }
}

function updateIndicator() {
  const todosContainer = document.getElementById("todos-container");
  const overflowIndicator = document.getElementById("overflow-indicator");

  // Check if the user has scrolled to the bottom
  const isAtBottom =
    todosContainer.scrollTop + todosContainer.clientHeight >=
    todosContainer.scrollHeight;

  // Show the indicator only if not at the bottom
  if (isAtBottom) {
    overflowIndicator.classList.remove("show");
  } else {
    overflowIndicator.classList.add("show");
  }
}

// Todo CRUD functions
function addTodo() {
  const todoInput = document.getElementById("todo-input");
  const prioritySelect = document.getElementById("priority");
  const id = Math.floor(Math.random() * 1000000);
  const todoText = todoInput.value.trim();
  const priority = prioritySelect.value;
  if (todoText) {
    const data = {
      id: id,
      text: todoText,
      priority: priority,
      checked: false,
    };
    todos.push(data);
    saveDataToLocalStorage();
  }
  todoInput.value = "";
  stopSearching();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  updateTodos();
}

function deleteAllTodos() {
  todos = [];
  updateTodos();
}

function checkTodo(id, checkState) {
  todos = todos.map((todo) => {
    return todo.id === id ? { ...todo, checked: !checkState } : { ...todo };
  });
  updateTodos();
}

function changePriority(id, newPriority) {
  todos = todos.map((todo) => {
    return todo.id === id ? { ...todo, priority: newPriority } : { ...todo };
  });
  saveDataToLocalStorage();
  showTodos();
  stopSearching();
}

// Confirmation models functions
function showDeleteAllConfirmation() {
  const deleteAllOverlay = newElement("div", { class: "delete-all-overlay" });
  const deleteAllConfirmation = newElement("div", {
    id: "delete-all-confirmation",
  });
  const confirmationText = newElement("p", {
    textContent: "Are you sure you want to delete all todos?",
  });
  const optionsBtns = newElement("div", { class: "options-btns" });
  const confirmBtn = newElement("button", {
    class: "confirm-btn btn",
    textContent: "confirm",
  });
  const cancelBtn = newElement("button", {
    class: "cancel-btn btn",
    textContent: "cancel",
  });
  appendChildren(optionsBtns, [confirmBtn, cancelBtn]);
  appendChildren(deleteAllConfirmation, [confirmationText, optionsBtns]);
  deleteAllOverlay.appendChild(deleteAllConfirmation);
  document.body.appendChild(deleteAllOverlay);

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(deleteAllOverlay);
  });

  confirmBtn.addEventListener("click", () => {
    deleteAllTodos();
    document.body.removeChild(deleteAllOverlay);
  });
}

function showEditForm(id, oldText) {
  const editFormOverlay = newElement("div", { class: "edit-form-overlay" });
  const editForm = newElement("div", { id: "edit-form" });
  const editLabel = newElement("label", { textContent: "Edit your todo ✍️" });
  const editInput = newElement("input", {
    type: "text",
    class: "edit-input input",
    value: oldText,
  });
  const optionsBtns = newElement("div", { class: "options-btns" });
  const editBtn = newElement("button", {
    class: "btn edit-form-btn",
    textContent: "edit",
  });
  const cancelBtn = newElement("button", {
    class: "btn cancel-form-btn",
    textContent: "cancel",
  });

  appendChildren(editForm, [editLabel, editInput]);
  appendChildren(optionsBtns, [editBtn, cancelBtn]);
  editForm.appendChild(optionsBtns);
  editFormOverlay.appendChild(editForm);
  document.body.appendChild(editFormOverlay);

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(editFormOverlay);
  });

  editBtn.addEventListener("click", () => {
    editTodo(id, editInput.value);
    document.body.removeChild(editFormOverlay);
  });
}

function editTodo(id, newText) {
  todos = todos.map((todo) => {
    return todo.id === id ? { ...todo, text: newText } : { ...todo };
  });
  updateTodos();
}

// To-do's list sorting and updating functions
function sortTodos() {
  let highTodos = [];
  let mediumTodos = [];
  let lowTodos = [];
  let noneTodos = [];
  let sorted = [];
  for (let todo of todos) {
    switch (todo.priority) {
      case "high":
        highTodos.push(todo);
        break;
      case "medium":
        mediumTodos.push(todo);
        break;
      case "low":
        lowTodos.push(todo);
        break;
      case "none":
        noneTodos.push(todo);
        break;
      default:
        break;
    }
  }
  todos = [...noneTodos, ...lowTodos, ...mediumTodos, ...highTodos];
  for (let todo of todos) {
    if (todo.checked) {
      sorted.unshift(todo);
    } else {
      sorted.push(todo);
    }
  }
  todos = sorted;
}

function updateTodos() {
  saveDataToLocalStorage();
  showTodos();
  stopSearching();
  sortTodos();
}

// Local storage functions
function saveDataToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function getDataFromLocalStorage() {
  const data = localStorage.getItem("todos");
  // Check if there is data in the local storage
  if (data) {
    todos = JSON.parse(data);
    sortTodos();
  }
}

function getThemeFromLocalStorage() {
  const theme = localStorage.getItem("theme");
  if (theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
      themeBtn.classList.remove("light");
      themeBtn.classList.add("dark");
    } else {
      themeBtn.classList.remove("dark");
      themeBtn.classList.add("light");
    }
  }
}

// Dom manipulation functions
function newElement(type, { ...attributes }, childElement) {
  const element = document.createElement(type);

  // Add class name, id, and other attributes to the element
  for (let key of Object.keys(attributes)) {
    if (key === "textContent") {
      element.textContent = attributes[key];
    } else {
      element.setAttribute(key, attributes[key]);
    }
  }

  // Append the child element
  if (childElement) {
    element.appendChild(childElement);
  }

  return element;
}

function appendChildren(parentElement, [...children]) {
  // Append multiple elements at once
  for (let child of children) {
    parentElement.appendChild(child);
  }
}
