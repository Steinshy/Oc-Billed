import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTER, TEST_ROUTES } from "../__mocks__/testConstants.js";
import { setupTestEnvironment } from "../__mocks__/testHelpers.js";
import Router from "../app/Router.js";
import store from "../app/Store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import Bills from "../containers/Bills.js";
import Dashboard from "../containers/Dashboard.js";
import Login from "../containers/Login.js";
import { bills } from "../fixtures/bills.js";

jest.mock("../containers/Bills.js");
jest.mock("../containers/Dashboard.js", () => ({
  __esModule: true,
  default: jest.fn(),
  filteredBills: () => [],
}));
jest.mock("../containers/NewBill.js");
jest.mock("../containers/Login.js");

const {
  ACTIVE_ICON_CLASS,
  LAYOUT_ICON1_ID,
  LAYOUT_ICON2_ID,
  ROOT_ID,
  LOGIN_PAGE_CLASS,
  BILLS_PAGE_TITLE,
} = ROUTER;

const {
  LOGIN: TEST_ROUTE_LOGIN,
  BILLS: TEST_ROUTE_BILLS,
  DASHBOARD: TEST_ROUTE_DASHBOARD,
  UNKNOWN: TEST_ROUTE_UNKNOWN,
  OTHER: TEST_ROUTE_OTHER,
} = TEST_ROUTES;

function mockWindowLocation(pathname, hash = "") {
  try {
    window.history.pushState({}, "", pathname + hash);
  } catch (_e) {
    // Fallback: do nothing, some tests may fail
  }
}

describe("Given I am connected and I am on some page of the app", () => {
  const data = [];
  const loading = false;
  const error = null;

  describe("When I navigate to Login page", () => {
    test("Then, it should render Login page", () => {
      const html = ROUTES({ pathname: ROUTES_PATH["Login"], data, loading, error });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Administration")).toBeTruthy();
    });
  });

  describe("When I navigate to Bills page", () => {
    test("Then, it should render Bills page", () => {
      const html = ROUTES({ pathname: ROUTES_PATH["Bills"], data: [], loading, error });
      document.body.innerHTML = html;
      expect(screen.getAllByText(BILLS_PAGE_TITLE)).toBeTruthy();
    });

    test("Then, it should render Bills page with loading", () => {
      const html = ROUTES({ pathname: ROUTES_PATH["Bills"], data: [], loading: true, error });
      document.body.innerHTML = html;
      expect(screen.getByText("Loading...")).toBeTruthy();
    });

    test("Then, it should render Bills page with error", () => {
      const html = ROUTES({ pathname: ROUTES_PATH["Bills"], data: [], loading: false, error: "some error" });
      document.body.innerHTML = html;
      expect(screen.getByText("Erreur")).toBeTruthy();
    });
  });

  describe("When I navigate to NewBill page", () => {
    test("Then, it should render NewBill page", () => {
      const html = ROUTES({ pathname: ROUTES_PATH["NewBill"], data, loading, error });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When I navigate to Dashboard", () => {
    test("Then, it should render Dashboard page", () => {
      const html = ROUTES({ pathname: ROUTES_PATH["Dashboard"], data, loading, error });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Validations")).toBeTruthy();
    });
  });

  describe("When I navigate to anywhere else other than Login, Bills, NewBill, Dashboard", () => {
    test("Then, it should render Login page", () => {
      const html = ROUTES({ pathname: "/anywhere-else", data, loading, error });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Administration")).toBeTruthy();
    });
  });
});

describe("Given I am on the login page", () => {
  describe("When I navigate to the login page", () => {
    test("Then login page should be rendered with correct setup", async () => {
      setupTestEnvironment();
      await Router();
      const root = document.getElementById(ROOT_ID);
      document.body.classList.remove(LOGIN_PAGE_CLASS);
      Login.mockClear();
      Login.mockImplementation(() => ({}));

      window.onNavigate(ROUTES_PATH.Login);

      expect(root.innerHTML).toBeTruthy();
      expect(screen.getAllByText("Administration")).toBeTruthy();
      expect(document.body.classList.contains(LOGIN_PAGE_CLASS)).toBe(true);
      expect(Login).toHaveBeenCalledTimes(1);
      expect(Login).toHaveBeenCalledWith({
        document,
        localStorage: window.localStorage,
        onNavigate: window.onNavigate,
        store,
      });
    });
  });

  describe("When I navigate to the bills page", () => {
    test("Then the bills page should be rendered", async () => {
      setupTestEnvironment();
      await Router();
      Bills.mockImplementation(() => ({
        getBills: () => Promise.resolve(bills),
      }));

      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => {
        expect(screen.getByText(BILLS_PAGE_TITLE)).toBeTruthy();
      });
    });

    test("Then the bills page should be rendered even with API error", async () => {
      setupTestEnvironment();
      await Router();
      Bills.mockImplementation(() => ({
        getBills: () => Promise.reject(new Error("API Error")),
      }));

      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => {
        expect(screen.getByText("Erreur")).toBeTruthy();
      });
    });

    test("Then layout icons should be activated when they exist", async () => {
      setupTestEnvironment();
      await Router();
      const icon1 = document.getElementById(LAYOUT_ICON1_ID);
      const icon2 = document.getElementById(LAYOUT_ICON2_ID);

      Bills.mockImplementation(() => ({
        getBills: () => Promise.resolve(bills),
      }));

      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => {
        expect(icon1.classList.contains(ACTIVE_ICON_CLASS)).toBe(true);
        expect(icon2.classList.contains(ACTIVE_ICON_CLASS)).toBe(false);
      });
    });

    test("Then layout icons should not crash when they don't exist", async () => {
      setupTestEnvironment();
      await Router();
      document.getElementById(LAYOUT_ICON1_ID)?.remove();
      document.getElementById(LAYOUT_ICON2_ID)?.remove();

      Bills.mockImplementation(() => ({
        getBills: () => Promise.resolve(bills),
      }));

      expect(() => window.onNavigate(ROUTES_PATH.Bills)).not.toThrow();
      await waitFor(() => {
        expect(screen.getByText(BILLS_PAGE_TITLE)).toBeTruthy();
      });
    });

    test("Then layout icons should be activated in Bills success callback when they exist", async () => {
      setupTestEnvironment();
      await Router();
      const icon1 = document.getElementById(LAYOUT_ICON1_ID);
      const icon2 = document.getElementById(LAYOUT_ICON2_ID);

      Bills.mockImplementation(() => ({
        getBills: () => Promise.resolve(bills),
      }));

      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => {
        expect(screen.getByText(BILLS_PAGE_TITLE)).toBeTruthy();
        expect(icon1.classList.contains(ACTIVE_ICON_CLASS)).toBe(true);
        expect(icon2.classList.contains(ACTIVE_ICON_CLASS)).toBe(false);
      });
    });

    test("Then layout icons should not crash in Bills success callback when they don't exist", async () => {
      setupTestEnvironment();
      await Router();
      Bills.mockImplementation(() => ({
        getBills: () => Promise.resolve(bills),
      }));

      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => {
        expect(screen.getByText(BILLS_PAGE_TITLE)).toBeTruthy();
      });

      document.getElementById(LAYOUT_ICON1_ID)?.remove();
      document.getElementById(LAYOUT_ICON2_ID)?.remove();

      Bills.mockImplementation(() => ({
        getBills: () => Promise.resolve(bills),
      }));
      expect(() => window.onNavigate(ROUTES_PATH.Bills)).not.toThrow();
    });
  });

  describe("When I navigate to the new bill page", () => {
    test("Then the new bill page should be rendered", async () => {
      setupTestEnvironment();
      await Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => {
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });

    test("Then layout icons should be activated when they exist", async () => {
      setupTestEnvironment();
      await Router();
      const icon1 = document.getElementById(LAYOUT_ICON1_ID);
      const icon2 = document.getElementById(LAYOUT_ICON2_ID);

      window.onNavigate(ROUTES_PATH.NewBill);
      expect(icon1.classList.contains(ACTIVE_ICON_CLASS)).toBe(false);
      expect(icon2.classList.contains(ACTIVE_ICON_CLASS)).toBe(true);
    });

    test("Then layout icons should not crash when they don't exist", async () => {
      setupTestEnvironment();
      await Router();
      document.getElementById(LAYOUT_ICON1_ID)?.remove();
      document.getElementById(LAYOUT_ICON2_ID)?.remove();

      expect(() => window.onNavigate(ROUTES_PATH.NewBill)).not.toThrow();
    });
  });

  describe("When I navigate to the dashboard page", () => {
    test("Then the dashboard page should be rendered", async () => {
      setupTestEnvironment();
      await Router();
      Dashboard.mockImplementation(() => ({
        getBillsAllUsers: () => Promise.resolve(bills),
      }));

      window.onNavigate(ROUTES_PATH.Dashboard);

      await waitFor(() => {
        expect(screen.getByText("Validations")).toBeTruthy();
      });
    });

    test("Then the dashboard page should be rendered even with API error", async () => {
      setupTestEnvironment();
      await Router();
      Dashboard.mockImplementation(() => ({
        getBillsAllUsers: () => Promise.reject(new Error("API Error")),
      }));

      window.onNavigate(ROUTES_PATH.Dashboard);

      await waitFor(() => {
        expect(screen.getByText("Erreur")).toBeTruthy();
      });
    });
  });

  describe("When I go back in history", () => {
    test("Then login page should be rendered when no user", async () => {
      window.localStorage.removeItem("user");
      setupTestEnvironment({ user: null });
      const root = document.getElementById(ROOT_ID);

      const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
      window.localStorage.getItem = jest.fn((key) => {
        if (key === "user") return null;
        return originalGetItem(key);
      });

      await Router();

      fireEvent.popState(window);

      expect(document.body.classList.contains(LOGIN_PAGE_CLASS)).toBe(true);
      expect(root.innerHTML).toBeTruthy();
      expect(screen.getAllByText("Administration")).toBeTruthy();

      window.localStorage.getItem = originalGetItem;
    });

    test("Then nothing should happen when no user", async () => {
      window.localStorage.removeItem("user");
      setupTestEnvironment({ user: null });

      const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
      window.localStorage.getItem = jest.fn((key) => {
        if (key === "user") return null;
        return originalGetItem(key);
      });

      await Router();

      const onNavigateSpy = jest.fn();
      window.onNavigate = onNavigateSpy;

      fireEvent.popState(window);

      expect(onNavigateSpy).not.toHaveBeenCalled();
      window.localStorage.getItem = originalGetItem;
    });

    test("Then onNavigate should be called when user is logged in and not at login page", async () => {
      setupTestEnvironment();
      mockWindowLocation(ROUTES_PATH["Bills"], "");

      const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
      window.localStorage.getItem = jest.fn((key) => {
        if (key === "user")
          return JSON.stringify({ email: "employee@example.com", type: "Employee" });
        return originalGetItem(key);
      });

      Bills.mockImplementation(() => ({
        getBills: () => Promise.resolve(bills),
      }));

      await Router();

      const onNavigateSpy = jest.fn();
      window.onNavigate = onNavigateSpy;

      // Call onpopstate directly with a page other than "/"
      // Simulate being on a non-root page when popstate occurs
      window.history.pushState({}, "", ROUTES_PATH["Bills"]);
      fireEvent.popState(window);

      expect(onNavigateSpy).toHaveBeenCalled();
      window.localStorage.getItem = originalGetItem;
    });
  });

  describe("When Router initializes", () => {
    test("Then login page should be rendered", async () => {
      setupTestEnvironment();
      mockWindowLocation(TEST_ROUTE_LOGIN, "");

      Login.mockImplementation(() => ({}));
      await Router();

      expect(document.body.classList.contains(LOGIN_PAGE_CLASS)).toBe(true);
      expect(Login).toHaveBeenCalled();
    });

    test("Then nothing should happen when conditions are not met", async () => {
      setupTestEnvironment();
      mockWindowLocation(TEST_ROUTE_OTHER, "");
      document.body.classList.remove(LOGIN_PAGE_CLASS);

      Login.mockClear();
      Login.mockImplementation(() => {
        throw new Error("Login not available");
      });

      const result = await Router();

      expect(result).toBeNull();
      expect(document.body.classList.contains(LOGIN_PAGE_CLASS)).toBe(false);
    });

    test("Then Dashboard page should be rendered when hash is Dashboard", async () => {
      setupTestEnvironment();
      mockWindowLocation(TEST_ROUTE_LOGIN, TEST_ROUTE_DASHBOARD);

      Dashboard.mockImplementation(() => ({
        getBillsAllUsers: () => Promise.resolve(bills),
      }));

      await Router();

      await waitFor(() => {
        expect(screen.getByText("Validations")).toBeTruthy();
      });
    });

    test("Then Dashboard page should handle error when hash is Dashboard", async () => {
      setupTestEnvironment();
      mockWindowLocation(TEST_ROUTE_LOGIN, TEST_ROUTE_DASHBOARD);

      Dashboard.mockImplementation(() => ({
        getBillsAllUsers: () => Promise.reject(new Error("API Error")),
      }));

      await Router();

      await waitFor(() => {
        expect(screen.getByText("Erreur")).toBeTruthy();
      });
    });

    test("Then nothing should happen when hash exists but doesn't match routes", async () => {
      setupTestEnvironment();
      mockWindowLocation(TEST_ROUTE_LOGIN, TEST_ROUTE_UNKNOWN);

      Login.mockClear();
      const result = await Router();

      expect(result).toBeNull();
      expect(Login).not.toHaveBeenCalled();
    });
  });

});
