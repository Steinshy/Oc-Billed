// Shared test helper functions

import { localStorageMock } from "./localStorage.js";
import { ROUTER, DEFAULT_USER } from "./testConstants.js";

export function setupTestEnvironment(options = {}) {
  const {
    user = DEFAULT_USER,
    withIcons = true,
  } = options;

  document.body.innerHTML = "";
  const root = document.createElement("div");
  root.id = ROUTER.ROOT_ID;
  document.body.appendChild(root);

  if (withIcons) {
    const icon1 = document.createElement("div");
    icon1.id = ROUTER.LAYOUT_ICON1_ID;
    const icon2 = document.createElement("div");
    icon2.id = ROUTER.LAYOUT_ICON2_ID;
    document.body.appendChild(icon1);
    document.body.appendChild(icon2);
  }

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  if (user) {
    window.localStorage.setItem("user", JSON.stringify(user));
  } else {
    window.localStorage.removeItem("user");
  }

  return { root };
}

export function setupAdminUser() {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }));
}

export function setupEmployeeUser(email = "employee@test.com") {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email }));
}
