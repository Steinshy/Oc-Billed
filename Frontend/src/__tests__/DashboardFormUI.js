import { screen } from "@testing-library/dom";
import { formatDate, formatBillForDisplay } from "../app/format.js";
import DashboardFormUI, { modal } from "../views/DashboardFormUI.js";

const bill = {
  id: "47qAXb6fIm2zOKkLzMro",
  vat: "80",
  fileUrl:
    "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  status: "accepted",
  type: "Hôtel et logement",
  commentAdmin: "ok",
  commentary: "séminaire billed",
  name: "encore",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2004-04-04",
  amount: 400,
  email: "a@a",
  pct: 20,
};

const billAccepted = {
  ...bill,
  status: "accepted",
};

const billPending = {
  ...bill,
  status: "pending",
};

const billrefused = {
  ...bill,
  status: "refused",
};

describe("Given I am connected as an Admin and I am on Dashboard Page", () => {
  describe("When bill data is passed to DashboardUI", () => {
    test("Then, it should them in the page", () => {
      const html = DashboardFormUI(formatBillForDisplay(bill));
      document.body.innerHTML = html;
      expect(screen.getByText(bill.vat)).toBeTruthy();
      expect(screen.getByText(bill.type)).toBeTruthy();
      expect(screen.getByText(bill.commentary)).toBeTruthy();
      expect(screen.getByText(bill.name)).toBeTruthy();
      expect(screen.getByText(bill.fileName)).toBeTruthy();
      expect(screen.getByText(formatDate(bill.date))).toBeTruthy();
      expect(screen.getByText(bill.amount.toString())).toBeTruthy();
      expect(screen.getByText(bill.pct.toString())).toBeTruthy();
    });
  });
  describe("When pending bill is passed to DashboardUI", () => {
    test("Then, it should show button and textArea", () => {
      const html = DashboardFormUI(formatBillForDisplay(billPending));
      document.body.innerHTML = html;
      expect(screen.getByText("Accepter")).toBeTruthy();
      expect(screen.getByText("Refuser")).toBeTruthy();
      expect(screen.getByTestId("commentary2")).toBeTruthy();
    });
  });
  describe("When accepted bill is passed to DashboardUI", () => {
    test("Then, it should show admin commentary", () => {
      const html = DashboardFormUI(formatBillForDisplay(billAccepted));
      document.body.innerHTML = html;
      expect(screen.getByText(bill.commentAdmin)).toBeTruthy();
    });
  });
  describe("When refused bill is passed to DashboardUI", () => {
    test("Then, it should show admin commentary", () => {
      const html = DashboardFormUI(formatBillForDisplay(billrefused));
      document.body.innerHTML = html;
      expect(screen.getByText(bill.commentAdmin)).toBeTruthy();
    });
  });
  describe("When bill has valid file", () => {
    test("Then, it should show file name and eye icon", () => {
      const html = DashboardFormUI(formatBillForDisplay(bill));
      document.body.innerHTML = html;
      expect(screen.getByTestId("icon-eye-d")).toBeTruthy();
      expect(document.querySelector("#file-name-admin")).toBeTruthy();
      expect(screen.queryByText("Le fichier n'est pas valide.")).toBeFalsy();
    });
    test("Then, it should use displayFileName if available, otherwise fileName", () => {
      const formattedBill = formatBillForDisplay(bill);
      formattedBill.displayFileName = "custom-display-name.jpg";
      const html = DashboardFormUI(formattedBill);
      document.body.innerHTML = html;
      expect(screen.getByText(/custom-display-name\.jpg/i)).toBeTruthy();
    });
    test("Then, it should fallback to fileName when displayFileName is empty", () => {
      const formattedBill = formatBillForDisplay(bill);
      formattedBill.displayFileName = "";
      const html = DashboardFormUI(formattedBill);
      document.body.innerHTML = html;
      expect(screen.getByText(bill.fileName)).toBeTruthy();
    });
    test("Then, it should set data-bill-url attribute with displayFileUrl", () => {
      const html = DashboardFormUI(formatBillForDisplay(bill));
      document.body.innerHTML = html;
      const eyeIcon = screen.getByTestId("icon-eye-d");
      const billUrl = eyeIcon.getAttribute("data-bill-url");
      expect(billUrl).toBeTruthy();
      expect(billUrl).toBe(bill.fileUrl);
    });
  });
  describe("When bill has invalid file", () => {
    test("Then, it should show error message", () => {
      const billInvalidFile = {
        ...bill,
        fileUrl: null,
      };
      const html = DashboardFormUI(formatBillForDisplay(billInvalidFile));
      document.body.innerHTML = html;
      expect(screen.getByText("Le fichier n'est pas valide.")).toBeTruthy();
      expect(screen.queryByTestId("icon-eye-d")).toBeFalsy();
    });
  });
  describe("When pending bill is passed to DashboardUI", () => {
    test("Then, it should show 'Ajouter un commentaire' label", () => {
      const html = DashboardFormUI(formatBillForDisplay(billPending));
      document.body.innerHTML = html;
      expect(screen.getByText("Ajouter un commentaire")).toBeTruthy();
    });
    test("Then, it should show accept and refuse buttons with correct testids", () => {
      const html = DashboardFormUI(formatBillForDisplay(billPending));
      document.body.innerHTML = html;
      expect(screen.getByTestId("btn-accept-bill-d")).toBeTruthy();
      expect(screen.getByTestId("btn-refuse-bill-d")).toBeTruthy();
    });
  });
  describe("When accepted or refused bill is passed to DashboardUI", () => {
    test("Then, it should show 'Votre commentaire' label", () => {
      const htmlAccepted = DashboardFormUI(formatBillForDisplay(billAccepted));
      document.body.innerHTML = htmlAccepted;
      expect(screen.getByText("Votre commentaire")).toBeTruthy();

      const htmlRefused = DashboardFormUI(formatBillForDisplay(billrefused));
      document.body.innerHTML = htmlRefused;
      expect(screen.getByText("Votre commentaire")).toBeTruthy();
    });
    test("Then, it should not show accept and refuse buttons", () => {
      const htmlAccepted = DashboardFormUI(formatBillForDisplay(billAccepted));
      document.body.innerHTML = htmlAccepted;
      expect(screen.queryByTestId("btn-accept-bill-d")).toBeFalsy();
      expect(screen.queryByTestId("btn-refuse-bill-d")).toBeFalsy();

      const htmlRefused = DashboardFormUI(formatBillForDisplay(billrefused));
      document.body.innerHTML = htmlRefused;
      expect(screen.queryByTestId("btn-accept-bill-d")).toBeFalsy();
      expect(screen.queryByTestId("btn-refuse-bill-d")).toBeFalsy();
    });
  });
});

describe("Given the modal function", () => {
  test("Then, it should render a modal with correct structure", () => {
    const html = modal();
    document.body.innerHTML = html;
    expect(screen.getByTestId("modaleFileAdmin")).toBeTruthy();
    expect(screen.getByText("Justificatif")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(document.querySelector(".modal-body")).toBeTruthy();
    expect(document.querySelector("#modaleFileAdmin1")).toBeTruthy();
  });
});
