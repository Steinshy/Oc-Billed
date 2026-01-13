import { screen, fireEvent, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { NEW_BILL } from "../__mocks__/testConstants.js";
import { ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";

jest.mock("../app/Store", () => mockStore);

const {
  EMPLOYEE_TYPE,
  FORM_TEST_ID: FORM_NEW_BILL_TEST_ID,
  TEST_EMAIL,
  TEST_FILE_URL,
  TEST_FILE_NAME,
  TEST_BILL_ID,
} = NEW_BILL;

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: EMPLOYEE_TYPE,
        email: TEST_EMAIL,
      }),
    );
  });

  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId(FORM_NEW_BILL_TEST_ID)).toBeTruthy();
    });

    test("Then it should handle missing form gracefully", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      document.body.innerHTML = "<div></div>";
      const onNavigate = jest.fn();

      new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Form not found when initializing CreateNewBill",
      );
      consoleErrorSpy.mockRestore();
    });

    test("Then it should handle missing file input gracefully", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      document.body.innerHTML = `<form data-testid="${FORM_NEW_BILL_TEST_ID}"></form>`;
      const onNavigate = jest.fn();

      new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "File input not found when initializing CreateNewBill",
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("When I select a valid image file", () => {
    test("Then it should accept jpg, jpeg, png image formats", async () => {
      const fileTypes = [
        { extension: "jpg", mimeType: "image/jpeg" },
        { extension: "jpeg", mimeType: "image/jpeg" },
        { extension: "png", mimeType: "image/png" },
      ];

      for (const fileType of fileTypes) {
        document.body.innerHTML = NewBillUI();
        const onNavigate = jest.fn();
        const storeWithApi = {
          ...mockStore,
          api: { baseUrl: "https://localhost:3456" },
        };
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: storeWithApi,
          localStorage: window.localStorage,
        });

        const fileName = `test.${fileType.extension}`;
        const file = new File(["test"], fileName, { type: fileType.mimeType });

        const changeEvent = new Event("change", { bubbles: true });
        Object.defineProperty(changeEvent, "preventDefault", {
          value: jest.fn(),
        });
        Object.defineProperty(changeEvent, "target", {
          value: {
            files: [file],
            value: `C:\\fakepath\\${fileName}`,
          },
          writable: false,
        });

        changeEvent.target.closest = jest.fn().mockReturnValue({
          querySelector: jest.fn().mockReturnValue(null),
          appendChild: jest.fn(),
        });

        newBillInstance.handleFileChange(changeEvent);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const errorMessage = document.querySelector(".file-error-message");
        expect(errorMessage).toBeNull();
      }
    });

  });

  describe("When I select no file", () => {
    test("Then it should reset file data", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      newBillInstance.fileUrl = "http://example.com/file.jpg";
      newBillInstance.fileName = "test.jpg";
      newBillInstance.billId = "123";

      const changeEvent = new Event("change", { bubbles: true });
      Object.defineProperty(changeEvent, "preventDefault", {
        value: jest.fn(),
      });
      Object.defineProperty(changeEvent, "target", {
        value: {
          files: [],
          value: "",
        },
        writable: false,
      });

      newBillInstance.handleFileChange(changeEvent);

      expect(newBillInstance.fileUrl).toBeNull();
      expect(newBillInstance.fileName).toBeNull();
      expect(newBillInstance.filePath).toBeNull();
      expect(newBillInstance.billId).toBeNull();
    });
  });

  describe("When I select an invalid file", () => {
    test("Then it should show an error message for invalid file formats", () => {
      const invalidFormats = ["pdf", "doc", "docx", "xls", "txt"];

      for (const format of invalidFormats) {
        document.body.innerHTML = NewBillUI();
        const onNavigate = jest.fn();
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const fileInput = screen.getByTestId("file");
        const fileName = `test.${format}`;
        const file = new File(["test"], fileName, {
          type: "application/octet-stream",
        });

        const changeEvent = new Event("change", { bubbles: true });
        Object.defineProperty(changeEvent, "preventDefault", {
          value: jest.fn(),
        });

        const fileInputContainer = fileInput.closest(".col-half");

        Object.defineProperty(changeEvent, "target", {
          value: {
            files: [file],
            value: `C:\\fakepath\\${fileName}`,
            closest: jest.fn().mockReturnValue(fileInputContainer),
          },
          writable: false,
        });

        newBillInstance.handleFileChange(changeEvent);

        const errorMessage = document.querySelector(".file-error-message");
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.textContent).toBe(
          "Les fichiers autorisés sont: jpg, jpeg ou png",
        );
      }
    });
  });

  describe("When I submit the form", () => {
    beforeEach(() => {
      document.body.innerHTML = NewBillUI();
    });

    test("Then it should call updateBill and redirect on success", async () => {
      const updateSpy = jest.fn(() => Promise.resolve({}));
      const testStore = {
        bills() {
          return {
            update: updateSpy,
          };
        },
      };

      const onNavigate = jest.fn();
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: testStore,
        localStorage: window.localStorage,
      });

      newBillInstance.fileUrl = TEST_FILE_URL;
      newBillInstance.fileName = TEST_FILE_NAME;
      newBillInstance.billId = TEST_BILL_ID;
      newBillInstance.userData = { type: EMPLOYEE_TYPE, email: TEST_EMAIL };

      const form = screen.getByTestId(FORM_NEW_BILL_TEST_ID);
      const submitEvent = {
        preventDefault: jest.fn(),
        target: form,
      };

      newBillInstance.handleFormSubmit(submitEvent);
      expect(submitEvent.preventDefault).toHaveBeenCalled();
      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });

    test("Then it should capture all form field values correctly", async () => {
      const updateSpy = jest.fn(() => Promise.resolve({}));
      const storeWithSpy = {
        bills() {
          return {
            update: updateSpy,
          };
        },
      };

      const onNavigate = jest.fn();
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: storeWithSpy,
        localStorage: window.localStorage,
      });

      newBillInstance.fileUrl = TEST_FILE_URL;
      newBillInstance.fileName = TEST_FILE_NAME;
      newBillInstance.billId = TEST_BILL_ID;
      newBillInstance.userData = { type: EMPLOYEE_TYPE, email: TEST_EMAIL };

      const expenseType = screen.getByTestId("expense-type");
      const expenseName = screen.getByTestId("expense-name");
      const datepicker = screen.getByTestId("datepicker");
      const amount = screen.getByTestId("amount");
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      const commentary = screen.getByTestId("commentary");

      fireEvent.change(expenseType, { target: { value: "Transports" } });
      fireEvent.change(expenseName, { target: { value: "Test expense" } });
      fireEvent.change(datepicker, { target: { value: "2024-01-15" } });
      fireEvent.change(amount, { target: { value: "500" } });
      fireEvent.change(vat, { target: { value: "100" } });
      fireEvent.change(pct, { target: { value: "20" } });
      fireEvent.change(commentary, { target: { value: "Test commentary" } });

      const form = screen.getByTestId(FORM_NEW_BILL_TEST_ID);
      const submitEvent = {
        preventDefault: jest.fn(),
        target: form,
      };

      newBillInstance.handleFormSubmit(submitEvent);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith({
          data: JSON.stringify({
            email: TEST_EMAIL,
            type: "Transports",
            name: "Test expense",
            amount: 500,
            date: "2024-01-15",
            vat: "100",
            pct: 20,
            commentary: "Test commentary",
            fileUrl: TEST_FILE_URL,
            fileName: TEST_FILE_NAME,
            status: "pending",
          }),
          selector: TEST_BILL_ID,
        });
      });
    });

    test("Then it should not submit without file upload", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const onNavigate = jest.fn();
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const form = screen.getByTestId(FORM_NEW_BILL_TEST_ID);
      const submitEvent = {
        preventDefault: jest.fn(),
        target: form,
      };

      newBillInstance.handleFormSubmit(submitEvent);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(onNavigate).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Cannot submit bill: missing file upload",
      );

      consoleErrorSpy.mockRestore();
    });

    describe("When there is an API error", () => {
      test("Then it should not redirect and log error", async () => {
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const errorStore = {
          bills() {
            return {
              update: jest.fn(() => Promise.reject(new Error("Update failed"))),
            };
          },
        };

        const onNavigate = jest.fn();
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: errorStore,
          localStorage: window.localStorage,
        });

        newBillInstance.fileUrl = TEST_FILE_URL;
        newBillInstance.fileName = TEST_FILE_NAME;
        newBillInstance.billId = TEST_BILL_ID;

        const form = screen.getByTestId(FORM_NEW_BILL_TEST_ID);
        const submitEvent = {
          preventDefault: jest.fn(),
          target: form,
        };

        newBillInstance.handleFormSubmit(submitEvent);

        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        });
        expect(onNavigate).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      test("Then it should log error when update fails and handle the error", async () => {
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const consoleLogSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});
        const updateError = new Error("Update failed");
        const updateSpy = jest.fn(() => Promise.reject(updateError));
        const errorStore = {
          bills() {
            return {
              update: updateSpy,
            };
          },
        };

        const onNavigate = jest.fn();
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: errorStore,
          localStorage: window.localStorage,
        });

        newBillInstance.fileUrl = TEST_FILE_URL;
        newBillInstance.fileName = TEST_FILE_NAME;
        newBillInstance.billId = TEST_BILL_ID;
        newBillInstance.userData = { type: EMPLOYEE_TYPE, email: TEST_EMAIL };

        const form = screen.getByTestId(FORM_NEW_BILL_TEST_ID);
        const submitEvent = {
          preventDefault: jest.fn(),
          target: form,
        };

        newBillInstance.handleFormSubmit(submitEvent);

        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error updating bill:",
            updateError,
          );
        });
        expect(onNavigate).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
      });
    });
  });
});
