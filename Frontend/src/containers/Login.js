import { ROUTES_PATH } from "../constants/routes.js";

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, store }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.store = store;
    const formEmployee = this.document.querySelector("form[data-testid=\"form-employee\"]");
    formEmployee.addEventListener("submit", this.handleSubmitEmployee);
    const formAdmin = this.document.querySelector("form[data-testid=\"form-admin\"]");
    formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }
  handleSubmitEmployee = event => {
    event.preventDefault();
    const user = {
      type: "Employee",
      email: event.target.querySelector("input[data-testid=\"employee-email-input\"]").value,
      password: event.target.querySelector("input[data-testid=\"employee-password-input\"]").value,
      status: "connected",
    };
    this.localStorage.setItem("user", JSON.stringify(user));
    this.localStorage.removeItem("jwt");
    this.login(user).then(() => {
        this.onNavigate(ROUTES_PATH["Bills"]);
        this.document.body.classList.remove("login-page");
      });
  };

  // Bug 2 - Login : Corriger le handler de submit administrateur
  handleSubmitAdmin = event => {
    event.preventDefault();
    const user = {
      type: "Admin",
      email: event.target.querySelector('input[data-testid="admin-email-input"]').value,
      password: event.target.querySelector('input[data-testid="admin-password-input"]').value,
      status: "connected",
    };

    this.localStorage.setItem("user", JSON.stringify(user));
    this.localStorage.removeItem("jwt");
    this.login(user).then(() => {
        this.onNavigate(ROUTES_PATH["Dashboard"]);
        this.document.body.classList.remove("login-page");
      });
  };

  /* istanbul ignore next */
  login = user => {
    if (this.store) {
      return this.store
        .login(JSON.stringify({ email: user.email, password: user.password }))
        .then(({ jwt }) => {
          this.localStorage.setItem("jwt", jwt);
        })
        .catch(error => {
          return Promise.reject(error);
        });
    }
  };

  /* istanbul ignore next */
  createUser = user => {
    if (this.store) {
      return this.store.users()
        .create({ data: JSON.stringify({ type: user.type, name: user.email.split("@")[0], email: user.email, password: user.password }) })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user);
        })
        .catch(error => {
          return Promise.reject(error);
        });
    }
  };
}
