import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.fileUrl = null;
    this.fileName = null;
    this.filePath = null;
    this.billId = null;
    const userItem = localStorage.getItem("user");
    this.userData = userItem ? JSON.parse(userItem) : null;

    const formNewBill = this.document.querySelector('form[data-testid="form-new-bill"]');

    if (formNewBill) {formNewBill.addEventListener("submit", this.handleFormSubmit);}
    else console.error("Form not found when initializing CreateNewBill");

    const file = this.document.querySelector('input[data-testid="file"]');
    if (file) file.addEventListener("change", this.handleFileChange);
    else console.error("File input not found when initializing CreateNewBill");

    new Logout({ document, localStorage, onNavigate });
  }
  handleFileChange = event => {
    event.preventDefault();
    const fileInput = event.target;
    const file = fileInput?.files[0];

    if (!file) {
      this.fileUrl = null;
      this.fileName = null;
      this.filePath = null;
      this.billId = null;
      this.isUploading = false;
      this.uploadError = null;
      return;
    }

    const filePath = event.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const extension = fileName.split(".").pop().toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png"];

    const fileInputContainer = fileInput.closest(".col-half");
    const existingError = fileInputContainer.querySelector(".file-error-message");

    if (!allowedExtensions.includes(extension)) {
      if (!existingError) {
        const errorMessage = document.createElement("small");
        errorMessage.className = "file-error-message";
        errorMessage.textContent = "Les fichiers autorisés sont: jpg, jpeg ou png";
        fileInputContainer.appendChild(errorMessage);
      }
      fileInput.value = "";
      this.fileUrl = null;
      this.fileName = null;
      this.filePath = null;
      this.billId = null;
      return;
    }

    if (existingError) existingError.remove();

    const formData = new FormData();
    const userItem = localStorage.getItem("user");
    const user = userItem ? JSON.parse(userItem) : null;
    const email = this.userData?.email || user?.email;
    if (!email) {
      console.error("User email not found");
      return;
    }
    formData.append("file", file);
    formData.append("email", email);


    this.store.bills().create({ data: formData, headers: { noContentType: true } }).then(bill => {
      console.log("Bill created:", bill);
      this.billId = bill.key;
      this.filePath = bill.filePath;
      this.fileUrl = `${this.store.api.baseUrl}/${bill.filePath}`;
      this.fileName = fileName;
    }).catch(error => console.error(error));
  };

  handleFormSubmit = event => {
    event.preventDefault();
    console.log("Form submit started. billId:", this.billId, "fileUrl:", this.fileUrl);

    if (!this.billId || !this.fileUrl) {
      console.error("Cannot submit bill: missing file upload");
      return;
    }

    const userItem = localStorage.getItem("user");
    const user = userItem ? JSON.parse(userItem) : null;
    const email = this.userData?.email || user?.email;
    if (!email) {
      console.error("User email not found");
      return;
    }
    const bill = {
      email,
      type: event.target.querySelector('select[data-testid="expense-type"]').value,
      name: event.target.querySelector('input[data-testid="expense-name"]').value,
      amount: parseInt(event.target.querySelector('input[data-testid="amount"]').value),
      date: event.target.querySelector('input[data-testid="datepicker"]').value,
      vat: event.target.querySelector('input[data-testid="vat"]').value,
      pct: parseInt(event.target.querySelector('input[data-testid="pct"]').value) || 20,
      commentary: event.target.querySelector('textarea[data-testid="commentary"]').value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    console.log("Submitting bill:", bill);
    this.updateBill(bill);
  };

  // not need to cover this function by tests
  updateBill = bill => {
    if (this.store) {
      this.store
        .bills().update({ data: JSON.stringify(bill), selector: this.billId })
        .then((response) => {
          console.log("Bill updated successfully:", response);
          this.fileUrl = null;
          this.fileName = null;
          this.filePath = null;
          this.billId = null;
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch(error => {
          console.error("Error updating bill:", error);
        });
    }
  };
}
