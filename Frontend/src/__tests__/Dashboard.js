import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import Dashboard, { filteredBills, cards, shouldIncludeBill, card, getStatus } from "../containers/Dashboard.js";
import { bills } from "../fixtures/bills.js";
import DashboardUI from "../views/DashboardUI.js";

jest.mock("../app/Store.js", () => mockStore);

const BILL_47QAXB_TEST_ID = "open-bill47qAXb6fIm2zOKkLzMro";
const DASHBOARD_FORM_TEST_ID = "dashboard-form";
const STATUS_PENDING = "pending";
const STATUS_ACCEPTED = "accepted";
const STATUS_REFUSED = "refused";
const EMPLOYEE_EMAIL = "employee@test.com";
const OTHER_EMAIL = "other@test.com";
const MODAL_FILE_ADMIN_ID = "modaleFileAdmin1";
const ICON_EYE_D_SELECTOR = "#icon-eye-d";

function setupDashboard(options = {}) {
  const {
    bills: testBills = bills,
    store = mockStore,
    preservedSectionIndex = null,
  } = options;

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }));
  document.body.innerHTML = DashboardUI({ data: { bills: testBills } });

  const onNavigate = jest.fn((pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
  });

  const dashboard = new Dashboard({
    document,
    onNavigate,
    store,
    bills: testBills,
    localStorage: window.localStorage,
    preservedSectionIndex,
  });

  return { dashboard, onNavigate };
}

async function setupBillForm(dashboard) {
  dashboard.handleShowTickets(1);
  await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));
  dashboard.handleEditTicket(null, bills[0], bills);
  await waitFor(() => screen.getByTestId(DASHBOARD_FORM_TEST_ID));
};

describe("Utility Functions", () => {
  describe("getStatus", () => {
    test("should return the correct status for each index", () => {
      expect(getStatus(1)).toBe("pending");
      expect(getStatus(2)).toBe("accepted");
      expect(getStatus(3)).toBe("refused");
    });

    test("should return undefined for invalid indices", () => {
      expect(getStatus(0)).toBeUndefined();
      expect(getStatus(4)).toBeUndefined();
    });
  });

  describe("card", () => {
    test("should extract first and last names from email with dot separator", () => {
      const bill = {
        id: "test-id",
        email: "john.doe@example.com",
        name: "Test Bill",
        amount: 100,
        date: "2004-04-04",
        type: "Hôtel et logement",
      };
      const html = card(bill);
      document.body.innerHTML = html;

      expect(screen.getByText("john doe")).toBeTruthy();
      expect(screen.getByText("Test Bill")).toBeTruthy();
      expect(screen.getByText("100 €")).toBeTruthy();
      expect(screen.getByText("Hôtel et logement")).toBeTruthy();
    });

    test("should handle emails without dot separator", () => {
      const bill = {
        id: "test-id",
        email: "johndoe@example.com",
        name: "Test Bill",
        amount: 200,
        date: "2001-01-01",
        type: "Transports",
      };
      const html = card(bill);
      document.body.innerHTML = html;

      expect(screen.getByText("johndoe")).toBeTruthy();
      expect(screen.getByText("Test Bill")).toBeTruthy();
      expect(screen.getByText("200 €")).toBeTruthy();
    });

    test("should include all required bill information", () => {
      const bill = {
        id: "test-id-123",
        email: "test.user@example.com",
        name: "My Bill",
        amount: 500,
        date: "2003-03-03",
        type: "Services en ligne",
      };
      const html = card(bill);
      document.body.innerHTML = html;

      const cardElement = screen.getByTestId("open-billtest-id-123");
      expect(cardElement.classList.contains("bill-card")).toBe(true);
      expect(screen.getByText("test user")).toBeTruthy();
      expect(screen.getByText("My Bill")).toBeTruthy();
      expect(screen.getByText("500 €")).toBeTruthy();
      expect(screen.getByText("Services en ligne")).toBeTruthy();

      const dateElement = document.querySelector(".date-type-container span");
      expect(dateElement.textContent.trim()).toBeTruthy();
    });
  });

  describe("cards", () => {
    test("should return empty string when no bills or null/undefined", () => {
      document.body.innerHTML = cards([]);
      expect(screen.queryByTestId(BILL_47QAXB_TEST_ID)).toBeNull();

      document.body.innerHTML = cards(null);
      expect(screen.queryByTestId(BILL_47QAXB_TEST_ID)).toBeNull();

      document.body.innerHTML = cards(undefined);
      expect(screen.queryByTestId(BILL_47QAXB_TEST_ID)).toBeNull();
    });
  });

  describe("shouldIncludeBill", () => {
    describe("when user is Admin", () => {
      test("should exclude test user bills and include real user bills", () => {
        const testUserBill = { id: "1", email: USERS_TEST[0] };
        const realUserBill = { id: "2", email: "a@a" };

        expect(shouldIncludeBill(testUserBill, "admin@test.com", true)).toBe(false);
        expect(shouldIncludeBill(realUserBill, "admin@test.com", true)).toBe(true);

        USERS_TEST.forEach((testEmail) => {
          const bill = { id: "1", email: testEmail };
          expect(shouldIncludeBill(bill, "admin@test.com", true)).toBe(false);
        });
      });
    });

    describe("when user is Employee", () => {
      const EMPLOYEE_EMAIL = "employee@test.com";
      const OTHER_EMAIL = "other@test.com";

      test("should exclude test users and own bills", () => {
        const testUserBill = { id: "1", email: USERS_TEST[0] };
        const ownBill = { id: "2", email: EMPLOYEE_EMAIL };
        const otherBill = { id: "3", email: OTHER_EMAIL };

        expect(shouldIncludeBill(testUserBill, EMPLOYEE_EMAIL, false)).toBe(false);
        expect(shouldIncludeBill(ownBill, EMPLOYEE_EMAIL, false)).toBe(false);
        expect(shouldIncludeBill(otherBill, EMPLOYEE_EMAIL, false)).toBe(true);
      });
    });
  });

  describe("filteredBills", () => {
    test("should return correct bills for each status", () => {
      expect(filteredBills(bills, STATUS_PENDING).length).toBe(1);
      expect(filteredBills(bills, STATUS_ACCEPTED).length).toBe(1);
      expect(filteredBills(bills, STATUS_REFUSED).length).toBe(2);
    });

    describe("production environment", () => {
      const originalTestMode = process.env.REACT_APP_TEST_MODE;

      beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        process.env.REACT_APP_TEST_MODE = "false";
        jest.resetModules();
      });

      afterEach(() => {
        if (originalTestMode !== undefined) {
          process.env.REACT_APP_TEST_MODE = originalTestMode;
        } else {
          delete process.env.REACT_APP_TEST_MODE;
        }
      });

      test("should filter bills for Admin user in production", () => {
        process.env.REACT_APP_TEST_MODE = "false";
        jest.resetModules();
        const dashboardModule = require("../containers/Dashboard.js");
        window.localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "admin@test.com" }));

        const testBills = [
          { ...bills[0], status: STATUS_PENDING, email: "a@a" },
          { ...bills[1], status: STATUS_PENDING, email: USERS_TEST[0] },
        ];

        const filtered = dashboardModule.filteredBills(testBills, STATUS_PENDING);
        expect(filtered.length).toBe(1);
        expect(filtered[0].email).toBe("a@a");
      });

      test("should filter bills for Employee user in production", () => {
        jest.resetModules();
        const dashboardModule = require("../containers/Dashboard.js");
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: EMPLOYEE_EMAIL }));

        const testBills = [
          { id: "1", status: STATUS_PENDING, email: EMPLOYEE_EMAIL, name: "Bill 1", amount: 100, date: "2001-01-01", type: "Transports" },
          { id: "2", status: STATUS_PENDING, email: OTHER_EMAIL, name: "Bill 2", amount: 200, date: "2002-02-02", type: "Restaurants" },
          { id: "3", status: STATUS_PENDING, email: USERS_TEST[0], name: "Bill 3", amount: 300, date: "2003-03-03", type: "Services" },
        ];

        const filtered = dashboardModule.filteredBills(testBills, STATUS_PENDING);
        expect(filtered.length).toBe(2);
        expect(filtered[0].email).toBe(EMPLOYEE_EMAIL);
        expect(filtered[1].email).toBe(OTHER_EMAIL);
      });
    });
  });
});

describe("Given I am connected as an Admin", () => {
  describe("When I am on Dashboard page", () => {
    let dashboard;
    let onNavigate;

    beforeEach(() => {
      jest.useFakeTimers();
      const setup = setupDashboard();
      dashboard = setup.dashboard;
      onNavigate = setup.onNavigate;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("Then I should see the dashboard layout with bills", () => {
      expect(screen.getByText("Validations")).toBeTruthy();
      expect(screen.getByText(/En attente/)).toBeTruthy();
      expect(screen.getByText(/Validé/)).toBeTruthy();
      expect(screen.getByText(/Refusé/)).toBeTruthy();
    });

    describe("Click Handlers - Status Headers", () => {
      [1, 2, 3].forEach((index) => {
        test(`Then clicking on status-bills-header${index} should call handleShowTickets with ${index}`, async () => {
          const handleShowTicketsSpy = jest.spyOn(dashboard, "handleShowTickets");
          const header = document.querySelector(`#status-bills-header${index}`);
          fireEvent.click(header);
          expect(handleShowTicketsSpy).toHaveBeenCalledWith(index);
          await waitFor(() => {
            const container = document.querySelector(`#status-bills-container${index}`);
            expect(container).toBeTruthy();
          });
        });
      });
    });

    describe("Click Handlers - Arrow Icons", () => {
      [1, 2, 3].forEach((index) => {
        test(`Then clicking on arrow-icon${index} should call handleShowTickets with ${index} and stop propagation`, async () => {
          const handleShowTicketsSpy = jest.spyOn(dashboard, "handleShowTickets");
          const arrowIcon = document.querySelector(`#arrow-icon${index}`);
          const stopPropagationSpy = jest.fn();
          const mockEvent = $.Event("click");
          mockEvent.stopPropagation = stopPropagationSpy;
          $(arrowIcon).trigger(mockEvent);
          expect(stopPropagationSpy).toHaveBeenCalled();
          expect(handleShowTicketsSpy).toHaveBeenCalledWith(index);
          await waitFor(() => {
            const container = document.querySelector(`#status-bills-container${index}`);
            expect(container).toBeTruthy();
          });
        });
      });
    });

    describe("Constructor Event Handlers", () => {
      test("Then clicking on open-bill element should call handleEditTicket with the correct bill", async () => {
        dashboard.handleShowTickets(1);
        await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));
        const handleEditTicketSpy = jest.spyOn(dashboard, "handleEditTicket");
        const billElement = screen.getByTestId(BILL_47QAXB_TEST_ID);
        fireEvent.click(billElement);
        expect(handleEditTicketSpy).toHaveBeenCalled();
        await waitFor(() => screen.getByTestId(DASHBOARD_FORM_TEST_ID));
      });

      test("Then clicking on open-bill element with non-existent bill should not call handleEditTicket", async () => {
        dashboard.handleShowTickets(1);
        await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));
        const handleEditTicketSpy = jest.spyOn(dashboard, "handleEditTicket");
        const fakeBillElement = document.createElement("div");
        fakeBillElement.id = "open-billnonexistent";
        document.body.appendChild(fakeBillElement);
        fireEvent.click(fakeBillElement);
        expect(handleEditTicketSpy).not.toHaveBeenCalled();
      });

      describe("preservedSectionIndex", () => {
        test("Then Dashboard should restore preservedSectionIndex on initialization when set", () => {
          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          });
          window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }));
          document.body.innerHTML = DashboardUI({ data: { bills } });

          const onNavigate = jest.fn((pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          });

          const dashboard = new Dashboard({
            document,
            onNavigate,
            store: mockStore,
            bills,
            localStorage: window.localStorage,
            preservedSectionIndex: 1,
          });

          const handleShowTicketsSpy = jest.spyOn(dashboard, "handleShowTickets");

          jest.advanceTimersByTime(100);
          expect(handleShowTicketsSpy).toHaveBeenCalledWith(1);
          handleShowTicketsSpy.mockRestore();
        });

        test("Then Dashboard should not call handleShowTickets if headerElement does not exist", () => {
          const dashboardWithPreserved = setupDashboard({ preservedSectionIndex: 99 });
          const handleShowTicketsSpy = jest.spyOn(dashboardWithPreserved.dashboard, "handleShowTickets");

          jest.advanceTimersByTime(100);
          expect(handleShowTicketsSpy).not.toHaveBeenCalled();
          handleShowTicketsSpy.mockRestore();
        });

        test("Then Dashboard should not restore preservedSectionIndex when it is null", () => {
          const newDashboard = setupDashboard();
          const handleShowTicketsSpy = jest.spyOn(newDashboard.dashboard, "handleShowTickets");

          jest.advanceTimersByTime(100);
          expect(handleShowTicketsSpy).not.toHaveBeenCalled();
          handleShowTicketsSpy.mockRestore();
        });

        test("Then Dashboard should not restore preservedSectionIndex when bills array is empty", () => {
          const dashboardWithPreserved = setupDashboard({ bills: [], preservedSectionIndex: 1 });
          const handleShowTicketsSpy = jest.spyOn(dashboardWithPreserved.dashboard, "handleShowTickets");

          jest.advanceTimersByTime(100);
          expect(handleShowTicketsSpy).not.toHaveBeenCalled();
          handleShowTicketsSpy.mockRestore();
        });
      });
    });

    describe("Bill Management", () => {
      describe("handleShowTickets parameter handling", () => {
        test("Then handleShowTickets should use event when it is a number", async () => {
          dashboard.handleShowTickets(2);
          await waitFor(() => {
            const container = document.querySelector("#status-bills-container2");
            expect(container.innerHTML).toBeTruthy();
          });
        });

        test("Then handleShowTickets should use bills when it is a number and event is not", async () => {
          dashboard.handleShowTickets(null, 3);
          await waitFor(() => {
            const container = document.querySelector("#status-bills-container3");
            expect(container.innerHTML).toBeTruthy();
          });
        });

        test("Then handleShowTickets should use index when event and bills are not numbers", async () => {
          dashboard.handleShowTickets(null, null, 1);
          await waitFor(() => {
            const container = document.querySelector("#status-bills-container1");
            expect(container.innerHTML).toBeTruthy();
          });
        });
      });

      test("Then I can expand the pending bills list and view a bill", async () => {
        const handleShowTicketsSpy = jest.spyOn(dashboard, "handleShowTickets");
        const handleEditTicketSpy = jest.spyOn(dashboard, "handleEditTicket");

        dashboard.handleShowTickets(1);
        expect(handleShowTicketsSpy).toHaveBeenCalledWith(1);
        await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));

        dashboard.handleEditTicket(null, bills[0], bills);
        expect(handleEditTicketSpy).toHaveBeenCalled();
        await waitFor(() => screen.getByTestId(DASHBOARD_FORM_TEST_ID));
        const dashboardForm = screen.getByTestId(DASHBOARD_FORM_TEST_ID);
        expect(within(dashboardForm).getByText("Hôtel et logement")).toBeTruthy();
      });

      test("Then I can accept a bill", async () => {
        const updateSpy = jest.spyOn(mockStore.bills(), "update").mockResolvedValue({});
        await setupBillForm(dashboard);

        const mockEvent = { preventDefault: jest.fn() };
        dashboard.handleAcceptSubmit(mockEvent, bills[0]);

        await waitFor(() => expect(updateSpy).toHaveBeenCalled());
        await waitFor(() => expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]));
      });

      test("Then I can refuse a bill", async () => {
        const updateSpy = jest.spyOn(mockStore.bills(), "update").mockResolvedValue({});
        await setupBillForm(dashboard);

        const mockEvent = { preventDefault: jest.fn() };
        dashboard.handleRefuseSubmit(mockEvent, bills[0]);

        await waitFor(() => expect(updateSpy).toHaveBeenCalled());
        await waitFor(() => expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]));
      });

      test("Then getBillsAllUsers should return Promise.resolve([]) when store is null", async () => {
        const dashboardWithoutStore = setupDashboard({ store: null });
        const result = await dashboardWithoutStore.dashboard.getBillsAllUsers();
        expect(result).toEqual([]);
      });
    });

    describe("handleEditTicket", () => {
      test("Then handleEditTicket should handle switching from one bill to another", async () => {
        dashboard.handleShowTickets(1);
        await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));

        dashboard.handleEditTicket(null, bills[0], bills);
        await waitFor(() => screen.getByTestId(DASHBOARD_FORM_TEST_ID));
        expect(dashboard.id).toBe(bills[0].id);

        dashboard.handleShowTickets(3);
        await waitFor(() => {
          const container = document.querySelector("#status-bills-container3");
          expect(container.innerHTML).toBeTruthy();
        });

        dashboard.handleEditTicket(null, bills[1], bills);
        await waitFor(() => {
          const currentBill = document.querySelector(`#open-bill${bills[1].id}`);
          expect(currentBill).toBeTruthy();
        });
        expect(dashboard.id).toBe(bills[1].id);
        expect(dashboard.counter).toBe(1);
        expect($(`#open-bill${bills[0].id}`).css("background-color")).toBeTruthy();
        expect($(`#open-bill${bills[1].id}`).css("background-color")).toBeTruthy();
      });

      test("Then handleEditTicket should set id and counter when id is undefined", async () => {
        dashboard.handleShowTickets(1);
        await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));

        expect(dashboard.id).toBeUndefined();
        dashboard.handleEditTicket(null, bills[0], bills);
        await waitFor(() => screen.getByTestId(DASHBOARD_FORM_TEST_ID));

        expect(dashboard.id).toBe(bills[0].id);
        expect(dashboard.counter).toBe(1);
        expect($(".dashboard-right-container div").html()).toBeTruthy();
        expect($(".vertical-navbar").css("height")).toBe("150vh");
      });

      test("Then clicking btn-accept-bill after handleEditTicket should call handleAcceptSubmit", async () => {
        const updateSpy = jest.spyOn(mockStore.bills(), "update").mockResolvedValue({});
        await setupBillForm(dashboard);

        const handleAcceptSubmitSpy = jest.spyOn(dashboard, "handleAcceptSubmit");
        const acceptButton = document.querySelector("#btn-accept-bill");
        $(acceptButton).trigger("click");
        expect(handleAcceptSubmitSpy).toHaveBeenCalled();
        await waitFor(() => expect(updateSpy).toHaveBeenCalled());
      });

      test("Then clicking btn-refuse-bill after handleEditTicket should call handleRefuseSubmit", async () => {
        const updateSpy = jest.spyOn(mockStore.bills(), "update").mockResolvedValue({});
        await setupBillForm(dashboard);

        const handleRefuseSubmitSpy = jest.spyOn(dashboard, "handleRefuseSubmit");
        const refuseButton = document.querySelector("#btn-refuse-bill");
        $(refuseButton).trigger("click");
        expect(handleRefuseSubmitSpy).toHaveBeenCalled();
        await waitFor(() => expect(updateSpy).toHaveBeenCalled());
      });
    });

    describe("handleClickIconEye", () => {
      beforeEach(async () => {
        await setupBillForm(dashboard);
      });

      test("Then clicking icon-eye-d after handleEditTicket should call handleClickIconEye", async () => {
        await waitFor(() => {
          const iconEye = document.querySelector(ICON_EYE_D_SELECTOR);
          expect(iconEye).toBeTruthy();
          return iconEye;
        });
        const handleClickIconEyeSpy = jest.spyOn(dashboard, "handleClickIconEye");
        $(ICON_EYE_D_SELECTOR).off("click").click(handleClickIconEyeSpy);
        const iconEye = document.querySelector(ICON_EYE_D_SELECTOR);
        const modalElement = document.createElement("div");
        modalElement.id = MODAL_FILE_ADMIN_ID;
        modalElement.style.width = "800px";
        document.body.appendChild(modalElement);
        $.fn.modal = jest.fn();
        $(iconEye).trigger("click");
        await waitFor(() => expect(handleClickIconEyeSpy).toHaveBeenCalled());
      });

      test("Then handleClickIconEye should return early when icon has disabled class", () => {
        const iconEye = document.querySelector(ICON_EYE_D_SELECTOR);
        $(iconEye).addClass("disabled");
        const modalElement = document.createElement("div");
        modalElement.id = MODAL_FILE_ADMIN_ID;
        document.body.appendChild(modalElement);
        $.fn.modal = jest.fn();

        dashboard.handleClickIconEye();
        expect($.fn.modal).not.toHaveBeenCalled();
      });

      test("Then handleClickIconEye should return early when billUrl is invalid", () => {
        const iconEye = document.querySelector(ICON_EYE_D_SELECTOR);
        $(iconEye).attr("data-bill-url", "null");
        const modalElement = document.createElement("div");
        modalElement.id = MODAL_FILE_ADMIN_ID;
        document.body.appendChild(modalElement);
        $.fn.modal = jest.fn();

        dashboard.handleClickIconEye();
        expect($.fn.modal).not.toHaveBeenCalled();
      });

      test("Then handleClickIconEye should show modal when modal function exists", () => {
        const iconEye = document.querySelector(ICON_EYE_D_SELECTOR);
        const validUrl = "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg";
        $(iconEye).attr("data-bill-url", validUrl);

        const modalElement = document.createElement("div");
        modalElement.id = MODAL_FILE_ADMIN_ID;
        modalElement.style.width = "800px";
        const modalBody = document.createElement("div");
        modalBody.className = "modal-body";
        modalElement.appendChild(modalBody);
        document.body.appendChild(modalElement);

        const modalFn = jest.fn();
        $.fn.modal = modalFn;

        dashboard.handleClickIconEye();

        const $modalElement = $(`#${MODAL_FILE_ADMIN_ID}`);
        expect($modalElement.attr("aria-hidden")).toBe("false");
        expect(modalFn).toHaveBeenCalledWith("show");
        expect($modalElement.find(".modal-body").html()).toContain("bill-proof-container");
        expect($modalElement.find(".modal-body").html()).toContain(validUrl);
      });

      test("Then handleClickIconEye should not crash when modal function does not exist", () => {
        const iconEye = document.querySelector(ICON_EYE_D_SELECTOR);
        const validUrl = "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg";
        $(iconEye).attr("data-bill-url", validUrl);

        const modalElement = document.createElement("div");
        modalElement.id = MODAL_FILE_ADMIN_ID;
        modalElement.style.width = "800px";
        const modalBody = document.createElement("div");
        modalBody.className = "modal-body";
        modalElement.appendChild(modalBody);
        document.body.appendChild(modalElement);
        delete $.fn.modal;
        expect(() => dashboard.handleClickIconEye()).not.toThrow();

        const $modalElement = $(`#${MODAL_FILE_ADMIN_ID}`);
        expect($modalElement.attr("aria-hidden")).not.toBe("false");
        expect($modalElement.find(".modal-body").html()).toContain("bill-proof-container");
        expect($modalElement.find(".modal-body").html()).toContain(validUrl);
      });
    });

    describe("Error Scenarios", () => {
      beforeEach(async () => {
        await setupBillForm(dashboard);
      });

      test("Then API error when accepting bill should be handled gracefully", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        const updateSpy = jest.spyOn(mockStore.bills(), "update").mockRejectedValue(
          new Error("Failed to update bill"),
        );

        const mockEvent = { preventDefault: jest.fn() };
        await expect(dashboard.handleAcceptSubmit(mockEvent, bills[0])).rejects.toThrow("Failed to update bill");

        consoleErrorSpy.mockRestore();
        updateSpy.mockRestore();
      });

      test("Then API error when refusing bill should be handled gracefully", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        const updateSpy = jest.spyOn(mockStore.bills(), "update").mockRejectedValue(
          new Error("Failed to update bill"),
        );

        const mockEvent = { preventDefault: jest.fn() };
        await expect(dashboard.handleRefuseSubmit(mockEvent, bills[0])).rejects.toThrow("Failed to update bill");

        consoleErrorSpy.mockRestore();
        updateSpy.mockRestore();
      });

      test("Then network error when updating bill should be handled gracefully", async () => {
        const networkError = new Error("Network error");
        const updateSpy = jest.spyOn(mockStore.bills(), "update").mockRejectedValue(networkError);

        const mockEvent = { preventDefault: jest.fn() };
        await expect(dashboard.handleAcceptSubmit(mockEvent, bills[0])).rejects.toThrow();

        updateSpy.mockRestore();
      });

      test("Then clicking eye icon with invalid file URL should not open modal", async () => {
        const billWithInvalidUrl = {
          ...bills[0],
          fileUrl: null,
        };
        document.body.innerHTML = DashboardUI({ data: { bills: [billWithInvalidUrl] } });
        const dashboardWithInvalidFile = new Dashboard({
          document,
          onNavigate,
          store: mockStore,
          bills: [billWithInvalidUrl],
          localStorage: window.localStorage,
        });

        dashboardWithInvalidFile.handleShowTickets(1);
        await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));
        dashboardWithInvalidFile.handleEditTicket(null, billWithInvalidUrl, [billWithInvalidUrl]);
        await waitFor(() => screen.getByTestId(DASHBOARD_FORM_TEST_ID));

        const iconEye = screen.queryByTestId("icon-eye-d");
        expect(iconEye).toBeFalsy();
      });
    });

    test("Then I can view the proof modal", async () => {
      const arrow = screen.getByTestId("arrow-icon1");
      fireEvent.click(arrow);
      await waitFor(() => screen.getByTestId(BILL_47QAXB_TEST_ID));
      fireEvent.click(screen.getByTestId(BILL_47QAXB_TEST_ID));
      await waitFor(() => screen.getByTestId(DASHBOARD_FORM_TEST_ID));

      const iconEye = screen.getByTestId("icon-eye-d");
      $.fn.modal = jest.fn();
      fireEvent.click(iconEye);
      expect($.fn.modal).toHaveBeenCalledWith("show");
      expect(screen.getByTestId("modaleFileAdmin")).toBeTruthy();
    });
  });
});

describe("Given I am connected as an Employee", () => {
  describe("Bill Filtering", () => {
    test("should not display own bills when filtering", () => {
      const employeeBills = [
        { id: "1", email: EMPLOYEE_EMAIL, status: STATUS_PENDING },
        { id: "2", email: OTHER_EMAIL, status: STATUS_PENDING },
        { id: "3", email: USERS_TEST[0], status: STATUS_PENDING },
      ];

      const filtered = employeeBills.filter((bill) => {
        return shouldIncludeBill(bill, EMPLOYEE_EMAIL, false);
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].email).toBe(OTHER_EMAIL);
    });

    test("should exclude test users from bill list", () => {
      const testUserBill = { id: "1", email: USERS_TEST[0], status: STATUS_PENDING };

      expect(shouldIncludeBill(testUserBill, EMPLOYEE_EMAIL, false)).toBe(false);
    });
  });

  describe("When I am on Dashboard page", () => {
    test("should load dashboard with filtered bills for employee", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: EMPLOYEE_EMAIL }));
      document.body.innerHTML = DashboardUI({ data: { bills } });

      const onNavigate = jest.fn();
      const dashboard = new Dashboard({
        document,
        onNavigate,
        store: null,
        bills,
        localStorage: window.localStorage,
      });

      expect(dashboard).toBeTruthy();
      expect(dashboard.bills).toEqual(bills);
    });

    test("should display loading state for employee", () => {
      document.body.innerHTML = DashboardUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });

    test("should display error state for employee", () => {
      document.body.innerHTML = DashboardUI({ error: "error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});

describe("Given I am connected as an Admin - API Integration", () => {
  describe("Admin - API Integration", () => {
    test("should fetch and display bills from API successfully", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Dashboard);

      await waitFor(() => screen.getByText("Validations"));
      expect(await screen.getByText("En attente (1)")).toBeTruthy();
      expect(await screen.getByText("Refusé (2)")).toBeTruthy();
      expect(screen.getByTestId("big-billed-icon")).toBeTruthy();
    });

    describe("API Error Handling", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("should display 404 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Dashboard);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("should display 500 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Dashboard);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
