import { fireEvent, screen } from "@testing-library/dom";
import { LOGIN } from "../__mocks__/testConstants.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import Login from "../containers/Login.js";
import LoginUI from "../views/LoginUI.js";

const {
  FORM_EMPLOYEE_TEST_ID,
  FORM_ADMIN_TEST_ID,
  EMPLOYEE_EMAIL_INPUT_TEST_ID,
  EMPLOYEE_PASSWORD_INPUT_TEST_ID,
  ADMIN_EMAIL_INPUT_TEST_ID,
  ADMIN_PASSWORD_INPUT_TEST_ID,
} = LOGIN;

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

    });

  });

  describe("Admin Login", () => {
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

    });

  });
});
