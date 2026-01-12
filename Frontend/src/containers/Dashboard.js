import { formatDate, formatBillForDisplay, validateFileUrl } from "../app/format.js";
import BigBilledIcon from "../assets/svg/big_billed.js";
import { ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import Logout from "./Logout.js";

export const shouldIncludeBill = (bill, userEmail, isAdmin) => {
  if (isAdmin) {
    return !USERS_TEST.includes(bill.email);
  } else {
    return ![...USERS_TEST, userEmail].includes(bill.email);
  }
};

export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // in jest environment
        if (typeof jest !== "undefined") {
          selectCondition = bill.status === status;
        } else {
        /* istanbul ignore next */
          // in prod environment
          try {
            // Check if localStorage is available
            if (typeof localStorage === "undefined" || localStorage === null) {
              return false;
            }
            const userStr = localStorage.getItem("user");
            if (!userStr) {
              // If no user in localStorage, exclude this bill to avoid errors
              return false;
            }
            const user = JSON.parse(userStr);
            if (!user || !user.email) {
              // If user data is invalid, exclude this bill to avoid errors
              return false;
            }
            const userEmail = user.email;
            const isAdmin = user.type === "Admin";

            selectCondition = bill.status === status && shouldIncludeBill(bill, userEmail, isAdmin);
          } catch (error) {
            // If localStorage is not available or JSON parse fails, exclude this bill
            console.error("Error accessing user data:", error);
            return false;
          }
        }

        return selectCondition;
      })
    : [];
};

export const card = (bill) => {
  const firstAndLastNames = bill.email.split("@")[0];
  const firstName = firstAndLastNames.includes(".") ? firstAndLastNames.split(".")[0] : "";
  const lastName = firstAndLastNames.includes(".") ? firstAndLastNames.split(".")[1] : firstAndLastNames;

  return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${ bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `;
};

export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join("") : "";
};

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

export default class {
  constructor({ document, onNavigate, store, bills, localStorage, preservedSectionIndex = null }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.bills = bills;
    this.preservedSectionIndex = preservedSectionIndex;

    $(document).on("click", "#status-bills-header1", () => this.handleShowTickets(1));
    $(document).on("click", "#arrow-icon1", (event) => {
      event.stopPropagation();
      this.handleShowTickets(1);
    });
    $(document).on("click", "#status-bills-header2", () => this.handleShowTickets(2));
    $(document).on("click", "#arrow-icon2", (event) => {
      event.stopPropagation();
      this.handleShowTickets(2);
    });
    $(document).on("click", "#status-bills-header3", () => this.handleShowTickets(3));
    $(document).on("click", "#arrow-icon3", (event) => {
      event.stopPropagation();
      this.handleShowTickets(3);
    });


    $(document).on("click", '[id^="open-bill"]', event => {
      const billId = event.currentTarget.id.replace("open-bill", "");
      const bill = this.bills.find(b => b.id === billId);
      if (bill) {
        this.handleEditTicket(event, bill, this.bills);
      }
    });

    if (this.preservedSectionIndex !== null && this.bills && this.bills.length > 0) {
      setTimeout(() => {
        const headerElement = $(`#status-bills-header${this.preservedSectionIndex}`);
        if (headerElement.length > 0) {
          this.handleShowTickets(this.preservedSectionIndex);
        }
      }, 100);
    }
    new Logout({ localStorage, onNavigate });
  }

  handleShowTickets(event, bills, index) {
    const actualIndex = typeof event === "number" ? event : (typeof bills === "number" ? bills : index);
    const sectionIsOpen = this.index !== undefined && this.index !== actualIndex;

    const openTicketsSection = (index) => {
      this.index = index;
      this.preservedSectionIndex = index;
      this.isSectionOpen = true;
      $(`#arrow-icon${index}`).css({ transform: "rotate(0deg)" });
      $(`#status-bills-container${index}`).html(
        cards(filteredBills(this.bills, getStatus(this.index))),
      );
    };

    const closeTicketsSection = index => {
      this.isSectionOpen = false;
      $(`#arrow-icon${index}`).css({ transform: "rotate(90deg)" });
      $(`#status-bills-container${index}`).html("");
    };

    if (sectionIsOpen || this.index === undefined || !this.isSectionOpen) {
      openTicketsSection(actualIndex);
    } else {
      closeTicketsSection(actualIndex);
    }
    return this.bills;
  }

  handleClickIconEye = () => {
    const iconEyes = $("#icon-eye-d");
    if (iconEyes.hasClass("disabled")) return;

    const billUrl = iconEyes.attr("data-bill-url");
    if (validateFileUrl(billUrl)) return;
    const modalElement = $("#modaleFileAdmin1");
    const imgWidth = Math.floor(modalElement.width() * 0.8);
    modalElement.find(".modal-body")
      .html(`<div class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`);
    if (typeof modalElement.modal === "function") {
      modalElement.attr("aria-hidden", "false");
      modalElement.modal("show");
    }
  };
  handleEditTicket(e, bill, bills) {
    const isSwitchingTicket = this.id !== undefined && this.id !== bill.id;

    if (isSwitchingTicket) {
      $(`#open-bill${this.id}`).css({ background: "#0D5AE5" });
      this.id = bill.id;
      this.counter = 1;
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: "#0D5AE5" });
      });
      $(`#open-bill${bill.id}`).css({ background: "#2A2B35" });
      $(".dashboard-right-container div").html(DashboardFormUI(formatBillForDisplay(bill)));
      $(".vertical-navbar").css({ height: "150vh" });
    } else if (this.id === undefined) {
      this.id = bill.id;
      this.counter = 0;
    }

    if (!isSwitchingTicket) {
      if (this.counter % 2 === 0) {
        bills.forEach(b => {
          $(`#open-bill${b.id}`).css({ background: "#0D5AE5" });
        });
        $(`#open-bill${bill.id}`).css({ background: "#2A2B35" });
        $(".dashboard-right-container div").html(DashboardFormUI(formatBillForDisplay(bill)));
        $(".vertical-navbar").css({ height: "150vh" });
        this.counter++;
      } else {
        $(`#open-bill${bill.id}`).css({ background: "#0D5AE5" });
        $(".dashboard-right-container").html(`
          <h3> Validations </h3>
          <div id="big-billed-icon" data-testid="big-billed-icon">${BigBilledIcon}</div>
        `);
        $(".vertical-navbar").css({ height: "120vh" });
        this.counter++;
      }
    }

    $("#icon-eye-d").off("click").click(this.handleClickIconEye);
    $("#btn-accept-bill").click(event => this.handleAcceptSubmit(event, bill));
    $("#btn-refuse-bill").click(event => this.handleRefuseSubmit(event, bill));
  }

  handleAcceptSubmit = async (event, bill) => {
    event.preventDefault();
    const newBill = {
      id: bill.id,
      name: bill.name,
      type: bill.type,
      email: bill.email,
      date: bill.date,
      vat: bill.vat,
      pct: bill.pct,
      commentary: bill.commentary,
      amount: bill.amount,
      status: "accepted",
      commentAdmin: $("#commentary2").val(),
    };
    await this.updateBill(newBill);
    const updatedBills = this.bills.map(b => b.id === bill.id ? newBill : b);
    this.bills = updatedBills;
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };

  handleRefuseSubmit = async (event, bill) => {
    event.preventDefault();
    const newBill = {
      id: bill.id,
      name: bill.name,
      type: bill.type,
      email: bill.email,
      date: bill.date,
      vat: bill.vat,
      pct: bill.pct,
      commentary: bill.commentary,
      amount: bill.amount,
      status: "refused",
      commentAdmin: $("#commentary2").val(),
    };
    await this.updateBill(newBill);
    const updatedBills = this.bills.map(b => b.id === bill.id ? newBill : b);
    this.bills = updatedBills;
    this.onNavigate(ROUTES_PATH["Dashboard"]);
  };


  getBillsAllUsers = () => this.store ? this.store.bills().list()
    .then(snapshot => snapshot.map(doc => ({ id: doc.id, ...doc, date: doc.date, status: doc.status })))
    .catch(error => { throw error; }) : Promise.resolve([]);

  /* istanbul ignore next */
  updateBill = async (bill) => {
    if (!this.store) return;
    return await this.store.bills().update({ data: JSON.stringify(bill), selector: bill.id });
  };
}
