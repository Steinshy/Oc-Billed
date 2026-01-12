import { fireEvent, screen } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { singleBillArray as bills } from "../__mocks__/testData.js";
import { ROUTES } from "../constants/routes.js";
import Logout from "../containers/Logout.js";
import DashboardUI from "../views/DashboardUI.js";

describe("Given I am connected", () => {
  describe("When I click on disconnect button", () => {
    test("Then, I should be sent to login page", () => {
      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      });
      const mockLocalStorage = {
        ...localStorageMock,
        clear: jest.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        }),
      );
      document.body.innerHTML = DashboardUI({ bills });
      new Logout({ document, onNavigate, localStorage: mockLocalStorage });

      const disco = screen.getByTestId("layout-disconnect");
      fireEvent.click(disco);
      expect(mockLocalStorage.clear).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith("/");
      expect(screen.getByText("Administration")).toBeTruthy();
    });
  });
});
