export default class LobbyUsersList {
  #users;
  #listElement;
  #clickCallback;

  constructor(listElement, clickCallback) {
    this.#users = {};
    this.#listElement = listElement;
    this.#clickCallback = clickCallback;
  }

  add(userId, username, status) {
    // If the user is already present for some reason,
    // just update the information about him
    if (this.#users[userId]) {
      this.setStatus(userId, status);
      this.setName(userId, username);
    } else {
      // Otherwise, create new element and append it to DOM tree
      const el = this.#getUserListElement(userId, username, status);
      this.#users[userId] = el;
      this.#listElement.appendChild(el);
      // When the list item is clicked, it extracts the current
      // data about the user, and executes the callback
      el.addEventListener("click", (function(e) {
        const userId = parseInt(el.getAttribute("data-userid"));
        const userName = el.innerHTML;
        const state = el.className;
        this.#clickCallback.call(this, userId, userName, status);
      }).bind(this));
    }
  }

  setStatus(userId, status) {
    // Setting "status" means just updating the class name
    if (this.#users[userId]) {
      this.#users[userId].className = status;
    }
  }

  setName(userId, name) {
    // Name is innerHTML
    if (this.#users[userId]) {
      this.#users[userId].innerHTML = name;
    }
  }

  remove(userId) {
    if (this.#users[userId]) {
      this.#listElement.removeChild(this.#users[userId]);
      delete this.#users[userId];
    }
  }

  #getUserListElement(userId, userName, status) {
    // Create the new element (list item)
    // and set values
    const el = document.createElement("li");
    el.className = status;
    // We save the custom data, associated with this element,
    // using HTML5 data attributes
    // http://dev.w3.org/html5/spec/Overview.html#embedding-custom-non-visible-data-with-the-data-attributes
    el.setAttribute("data-userid", userId);
    el.innerHTML = userName;
    return el;
  }
}