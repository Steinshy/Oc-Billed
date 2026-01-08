import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import Login from "../containers/Login.js";
import LoginUI from "../views/LoginUI.js";

const FORM_EMPLOYEE_TEST_ID = "form-employee";
const FORM_ADMIN_TEST_ID = "form-admin";
const EMPLOYEE_EMAIL_INPUT_TEST_ID = "employee-email-input";
const EMPLOYEE_PASSWORD_INPUT_TEST_ID = "employee-password-input";
const ADMIN_EMAIL_INPUT_TEST_ID = "admin-email-input";
const ADMIN_PASSWORD_INPUT_TEST_ID = "admin-password-input";

describe("Given that I am a user on login page", () => {
  describe("Employee Login", () => {
    describe("Form Validation", () => {
      test("When I try to login with empty form, Then it should stay on login page", () => {
        document.body.innerHTML = LoginUI();

        const inputEmailUser = screen.getByTestId(EMPLOYEE_EMAIL_INPUT_TEST_ID);
        expect(inputEmailUser.value).toBe("");

        const inputPasswordUser = screen.getByTestId(EMPLOYEE_PASSWORD_INPUT_TEST_ID);
        expect(inputPasswordUser.value).toBe("");

        const form = screen.getByTestId(FORM_EMPLOYEE_TEST_ID);
        const handleSubmit = jest.fn((e) => e.preventDefault());

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(screen.getByTestId(FORM_EMPLOYEE_TEST_ID)).toBeTruthy();
      });

      test("When I try to login with invalid email format, Then it should stay on login page", () => {
        document.body.innerHTML = LoginUI();

        const inputEmailUser = screen.getByTestId(EMPLOYEE_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
        expect(inputEmailUser.value).toBe("pasunemail");

        const inputPasswordUser = screen.getByTestId(EMPLOYEE_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
        expect(inputPasswordUser.value).toBe("azerty");

        const form = screen.getByTestId(FORM_EMPLOYEE_TEST_ID);
        const handleSubmit = jest.fn((e) => e.preventDefault());

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(screen.getByTestId(FORM_EMPLOYEE_TEST_ID)).toBeTruthy();
      });
    });

    describe("Successful Login", () => {
      test("Then I should be identified as an Employee in the app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId(EMPLOYEE_EMAIL_INPUT_TEST_ID);
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId(EMPLOYEE_PASSWORD_INPUT_TEST_ID);
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId(FORM_EMPLOYEE_TEST_ID);

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
          removeItem: jest.fn(() => null),
        },
        writable: true,
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        }),
      );
    });

      test("Then it should navigate to Bills page", async () => {
        document.body.innerHTML = LoginUI();
        const inputData = {
          email: "johndoe@email.com",
          password: "azerty",
        };

        const inputEmailUser = screen.getByTestId(EMPLOYEE_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

        const inputPasswordUser = screen.getByTestId(EMPLOYEE_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, {
          target: { value: inputData.password },
        });

        const form = screen.getByTestId(FORM_EMPLOYEE_TEST_ID);

        Object.defineProperty(window, "localStorage", {
          value: {
            getItem: jest.fn(() => null),
            setItem: jest.fn(() => null),
            removeItem: jest.fn(() => null),
          },
          writable: true,
        });

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: null, loading: false, error: null });
        };

        const store = {
          login: jest.fn().mockResolvedValue({ jwt: "mock-jwt-token" }),
        };

        new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          store,
        });

        fireEvent.submit(form);

        await waitFor(() => {
          expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
        });
      });
    });

    describe("Error Handling", () => {
      test("When login fails with error, Then it should call createUser and navigate to Bills page", async () => {
        document.body.innerHTML = LoginUI();
        document.body.classList.add("login-page");
        const inputData = {
          email: "newuser@email.com",
          password: "azerty",
        };

        const inputEmailUser = screen.getByTestId(EMPLOYEE_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

        const inputPasswordUser = screen.getByTestId(EMPLOYEE_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, {
          target: { value: inputData.password },
        });

        const form = screen.getByTestId(FORM_EMPLOYEE_TEST_ID);

        const mockLocalStorage = {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
          removeItem: jest.fn(() => null),
        };

        Object.defineProperty(window, "localStorage", {
          value: mockLocalStorage,
          writable: true,
        });

        const onNavigate = jest.fn((pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: null, loading: false, error: null });
        });

        const mockCreateUser = jest.fn().mockResolvedValue({ jwt: "mock-jwt-token" });
        const mockLogin = jest.fn().mockRejectedValue(new Error("Login failed"));

        const store = {
          login: mockLogin,
          users: () => ({
            create: jest.fn().mockResolvedValue({}),
          }),
        };

        const login = new Login({
          document,
          localStorage: mockLocalStorage,
          onNavigate,
          store,
        });

        login.createUser = mockCreateUser;

        fireEvent.submit(form);

        await waitFor(() => {
          expect(mockLogin).toHaveBeenCalled();
          expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("jwt");
        });

        await waitFor(() => {
          expect(mockCreateUser).toHaveBeenCalledWith({
            type: "Employee",
            email: inputData.email,
            password: inputData.password,
            status: "connected",
          });
        });

        await waitFor(() => {
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
          expect(document.body.classList.contains("login-page")).toBe(false);
        });
      });

      test("When login fails without error, Then it should not call createUser but still navigate", async () => {
        document.body.innerHTML = LoginUI();
        document.body.classList.add("login-page");
        const inputData = {
          email: "newuser@email.com",
          password: "azerty",
        };

        const inputEmailUser = screen.getByTestId(EMPLOYEE_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

        const inputPasswordUser = screen.getByTestId(EMPLOYEE_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, {
          target: { value: inputData.password },
        });

        const form = screen.getByTestId(FORM_EMPLOYEE_TEST_ID);

        const mockLocalStorage = {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
          removeItem: jest.fn(() => null),
        };

        Object.defineProperty(window, "localStorage", {
          value: mockLocalStorage,
          writable: true,
        });

        const onNavigate = jest.fn((pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: null, loading: false, error: null });
        });

        const mockCreateUser = jest.fn();
        const mockLogin = jest.fn().mockRejectedValue(null);

        const store = {
          login: mockLogin,
          users: () => ({
            create: jest.fn().mockResolvedValue({}),
          }),
        };

        const login = new Login({
          document,
          localStorage: mockLocalStorage,
          onNavigate,
          store,
        });

        login.createUser = mockCreateUser;

        fireEvent.submit(form);

        await waitFor(() => {
          expect(mockLogin).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("jwt");
          expect(mockCreateUser).not.toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
          expect(document.body.classList.contains("login-page")).toBe(false);
        });
      });
    });

  });

  describe("Admin Login", () => {
    describe("Form Validation", () => {
      test("When I try to login with empty form, Then it should stay on login page", () => {
        document.body.innerHTML = LoginUI();

        const inputEmailUser = screen.getByTestId(ADMIN_EMAIL_INPUT_TEST_ID);
        expect(inputEmailUser.value).toBe("");

        const inputPasswordUser = screen.getByTestId(ADMIN_PASSWORD_INPUT_TEST_ID);
        expect(inputPasswordUser.value).toBe("");

        const form = screen.getByTestId(FORM_ADMIN_TEST_ID);
        const handleSubmit = jest.fn((e) => e.preventDefault());

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(screen.getByTestId(FORM_ADMIN_TEST_ID)).toBeTruthy();
      });

      test("When I try to login with invalid email format, Then it should stay on login page", () => {
        document.body.innerHTML = LoginUI();

        const inputEmailUser = screen.getByTestId(ADMIN_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
        expect(inputEmailUser.value).toBe("pasunemail");

        const inputPasswordUser = screen.getByTestId(ADMIN_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
        expect(inputPasswordUser.value).toBe("azerty");

        const form = screen.getByTestId(FORM_ADMIN_TEST_ID);
        const handleSubmit = jest.fn((e) => e.preventDefault());

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(screen.getByTestId(FORM_ADMIN_TEST_ID)).toBeTruthy();
      });
    });

    describe("Successful Login", () => {
      test("Then I should be identified as an HR admin in the app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId(ADMIN_EMAIL_INPUT_TEST_ID);
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId(ADMIN_PASSWORD_INPUT_TEST_ID);
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId(FORM_ADMIN_TEST_ID);

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
          removeItem: jest.fn(() => null),
        },
        writable: true,
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        }),
      );
    });

      test("Then it should navigate to HR dashboard page", async () => {
        document.body.innerHTML = LoginUI();
        const inputData = {
          email: "johndoe@email.com",
          password: "azerty",
        };

        const inputEmailUser = screen.getByTestId(ADMIN_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

        const inputPasswordUser = screen.getByTestId(ADMIN_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, {
          target: { value: inputData.password },
        });

        const form = screen.getByTestId(FORM_ADMIN_TEST_ID);

        Object.defineProperty(window, "localStorage", {
          value: {
            getItem: jest.fn(() => null),
            setItem: jest.fn(() => null),
            removeItem: jest.fn(() => null),
          },
          writable: true,
        });

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: null, loading: false, error: null });
        };

        const store = {
          login: jest.fn().mockResolvedValue({ jwt: "mock-jwt-token" }),
        };

        new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          store,
        });

        fireEvent.submit(form);

        await waitFor(() => {
          expect(screen.queryByText("Validations")).toBeTruthy();
        });
      });
    });

    describe("Error Handling", () => {
      test("When login fails with error, Then it should call createUser and navigate to Dashboard page", async () => {
        document.body.innerHTML = LoginUI();
        document.body.classList.add("login-page");
        const inputData = {
          email: "newadmin@email.com",
          password: "azerty",
        };

        const inputEmailUser = screen.getByTestId(ADMIN_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

        const inputPasswordUser = screen.getByTestId(ADMIN_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, {
          target: { value: inputData.password },
        });

        const form = screen.getByTestId(FORM_ADMIN_TEST_ID);

        const mockLocalStorage = {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
          removeItem: jest.fn(() => null),
        };

        Object.defineProperty(window, "localStorage", {
          value: mockLocalStorage,
          writable: true,
        });

        const onNavigate = jest.fn((pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: null, loading: false, error: null });
        });

        const mockCreateUser = jest.fn().mockResolvedValue({ jwt: "mock-jwt-token" });
        const mockLogin = jest.fn().mockRejectedValue(new Error("Login failed"));

        const store = {
          login: mockLogin,
          users: () => ({
            create: jest.fn().mockResolvedValue({}),
          }),
        };

        const login = new Login({
          document,
          localStorage: mockLocalStorage,
          onNavigate,
          store,
        });

        login.createUser = mockCreateUser;

        fireEvent.submit(form);

        await waitFor(() => {
          expect(mockLogin).toHaveBeenCalled();
          expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("jwt");
        });

        await waitFor(() => {
          expect(mockCreateUser).toHaveBeenCalledWith({
            type: "Admin",
            email: inputData.email,
            password: inputData.password,
            status: "connected",
          });
        });

        await waitFor(() => {
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]);
          expect(document.body.classList.contains("login-page")).toBe(false);
        });
      });

      test("When login fails without error, Then it should not call createUser but still navigate", async () => {
        document.body.innerHTML = LoginUI();
        document.body.classList.add("login-page");
        const inputData = {
          email: "newadmin@email.com",
          password: "azerty",
        };

        const inputEmailUser = screen.getByTestId(ADMIN_EMAIL_INPUT_TEST_ID);
        fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

        const inputPasswordUser = screen.getByTestId(ADMIN_PASSWORD_INPUT_TEST_ID);
        fireEvent.change(inputPasswordUser, {
          target: { value: inputData.password },
        });

        const form = screen.getByTestId(FORM_ADMIN_TEST_ID);

        const mockLocalStorage = {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
          removeItem: jest.fn(() => null),
        };

        Object.defineProperty(window, "localStorage", {
          value: mockLocalStorage,
          writable: true,
        });

        const onNavigate = jest.fn((pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: null, loading: false, error: null });
        });

        const mockCreateUser = jest.fn();
        const mockLogin = jest.fn().mockRejectedValue(null);

        const store = {
          login: mockLogin,
          users: () => ({
            create: jest.fn().mockResolvedValue({}),
          }),
        };

        const login = new Login({
          document,
          localStorage: mockLocalStorage,
          onNavigate,
          store,
        });

        login.createUser = mockCreateUser;

        fireEvent.submit(form);

        await waitFor(() => {
          expect(mockLogin).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("jwt");
          expect(mockCreateUser).not.toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]);
          expect(document.body.classList.contains("login-page")).toBe(false);
        });
      });
    });

  });
});
