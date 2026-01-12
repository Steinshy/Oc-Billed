import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/Store.js", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        }),
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/\d{4}-\d{2}-\d{2}/)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe("When I load my bills", () => {
      test("Then bills should be fetched and formatted correctly", async () => {
        const onNavigate = jest.fn();
        const mockStore = {
          bills: jest.fn(() => ({
            list: jest.fn(() => Promise.resolve([
              {
                id: "1",
                status: "pending",
                date: "2004-04-04",
                amount: 100,
                type: "Transports",
              },
              {
                id: "2",
                status: "accepted",
                date: "2003-03-03",
                amount: 200,
                type: "Restaurants",
              },
            ])),
          })),
        };

        const billsInstance = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const result = await billsInstance.getBills();

        expect(result).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[0].date).toBe("4 Avr. 04");
        expect(result[0].status).toBe("En attente");
        expect(result[1].date).toBe("3 Mar. 03");
        expect(result[1].status).toBe("Accepté");
      });

      test("Then corrupted bill data should be handled gracefully", async () => {
        const onNavigate = jest.fn();
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        const mockStore = {
          bills: jest.fn(() => ({
            list: jest.fn(() => Promise.resolve([
              {
                id: "1",
                status: "pending",
                date: "invalid-date",
                amount: 100,
                type: "Transports",
              },
            ])),
          })),
        };

        const billsInstance = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const result = await billsInstance.getBills();

        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].date).toBe("invalid-date");
        expect(result[0].status).toBe("En attente");
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      test("Then empty bills list should return empty array", async () => {
        const onNavigate = jest.fn();
        const mockStore = {
          bills: jest.fn(() => ({
            list: jest.fn(() => Promise.resolve([])),
          })),
        };

        const billsInstance = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const result = await billsInstance.getBills();

        expect(result).toBeTruthy();
        expect(result.length).toBe(0);
      });

      test("Then getBills should return undefined when store is unavailable", () => {
        const onNavigate = jest.fn();

        const billsInstance = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: localStorageMock,
        });

        const result = billsInstance.getBills();

        expect(result).toBeUndefined();
      });

      test("Then API error should be handled gracefully", async () => {
        const onNavigate = jest.fn();
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const mockStore = {
          bills: jest.fn(() => ({
            list: jest.fn().mockRejectedValue(new Error("API Error: Failed to fetch bills")),
          })),
        };

        const billsInstance = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        await expect(billsInstance.getBills()).rejects.toThrow("API Error: Failed to fetch bills");

        consoleErrorSpy.mockRestore();
      });

      test("Then network error should be handled gracefully", async () => {
        const onNavigate = jest.fn();

        const mockStore = {
          bills: jest.fn(() => ({
            list: jest.fn().mockRejectedValue(new Error("Network error")),
          })),
        };

        const billsInstance = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        await expect(billsInstance.getBills()).rejects.toThrow("Network error");
      });

      test("Then 404 error should be handled gracefully", async () => {
        const onNavigate = jest.fn();

        const mockStore = {
          bills: jest.fn(() => ({
            list: jest.fn().mockRejectedValue(new Error("404 Not Found")),
          })),
        };

        const billsInstance = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        await expect(billsInstance.getBills()).rejects.toThrow("404 Not Found");
      });
    });

    test("Then clicking on eye icon should open modal with bill image", () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = BillsUI({ data: bills });
      const modalMock = jest.fn();
      const originalModal = $.fn.modal;
      $.fn.modal = modalMock;
      $.fn.width = jest.fn(() => 1000);
      new Bills({ document, onNavigate, store: null, localStorage: localStorageMock });
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      const billUrl = iconEye.getAttribute("data-bill-url");
      fireEvent.click(iconEye);
      const modal = document.querySelector("#modaleFile");
      expect(modal).toBeTruthy();
      expect(modal.getAttribute("aria-hidden")).toBe("false");
      const modalBody = modal.querySelector(".modal-body");
      const img = modalBody.querySelector("img");
      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe(billUrl);
      expect(modalMock).toHaveBeenCalledWith("show");
      $.fn.modal = originalModal;
    });

    test("Then clicking on eye icon with invalid file URL should not open modal", () => {
      const onNavigate = jest.fn();
      const invalidUrls = [null, "null", undefined];

      invalidUrls.forEach((invalidUrl) => {
        const billsWithInvalidUrl = [
          {
            ...bills[0],
            fileUrl: invalidUrl,
          },
        ];
        document.body.innerHTML = BillsUI({ data: billsWithInvalidUrl });
        const modalMock = jest.fn();
        const originalModal = $.fn.modal;
        $.fn.modal = modalMock;
        new Bills({ document, onNavigate, store: null, localStorage: localStorageMock });
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        fireEvent.click(iconEye);
        expect(modalMock).not.toHaveBeenCalled();
        $.fn.modal = originalModal;
      });
    });

    test("Then clicking on 'Nouvelle note de frais' button should navigate to NewBill page", () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = BillsUI({ data: bills });
      new Bills({ document, onNavigate, store: null, localStorage: localStorageMock });
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      fireEvent.click(buttonNewBill);
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });
});

describe("Given I am connected as an Employee - API Integration", () => {
  describe("When I navigate to Bills page", () => {
    test("Then it should fetch bills from API and display them", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("tbody")).toBeTruthy();
      expect(screen.getByText("encore")).toBeTruthy();
      expect(screen.getByText("test1")).toBeTruthy();
      expect(screen.getByText("test2")).toBeTruthy();
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }));
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("Then it should display 404 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("Then it should display 500 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
