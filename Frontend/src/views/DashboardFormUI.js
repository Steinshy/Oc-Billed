import { formatDate } from "../app/format.js";
import calendarIcon from "../assets/svg/calendar.js";
import euroIcon from "../assets/svg/euro.js";
import eyeWhite from "../assets/svg/eye_white.js";
import pctIcon from "../assets/svg/pct.js";

export const modal = () => `
  <div class="modal fade" id="modaleFileAdmin1" data-testid="modaleFileAdmin" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" data-toggle="modal">
        </div>
      </div>
    </div>
  </div>
  `;

export default (formattedBill) => {
  return `
    <div class="container dashboard-form" data-testid="dashboard-form">
      <div class="row">
        <div class="col-sm" id="dashboard-form-col1">
          <label for="expense-type" class="bold-label">Type de dépense</label>
          <div class="input-field">${formattedBill.type}</div>
          <label for="expense-name" class="bold-label">Nom de la dépense</label>
          <div class="input-field">${formattedBill.name}</div>
          <label for="datepicker" class="bold-label">Date</label>
          <div class="input-field input-flex">
            <span>${formatDate(formattedBill.date)}</span>
            <span>${calendarIcon}</span>
          </div>
        </div>
        <div class="col-sm" id="dashboard-form-col2">
          <label for="commentary" class="bold-label">Commentaire</label>
          <div class="textarea-field">${formattedBill.commentary}</div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm">
          <label for="amount" class="bold-label">Montant TTC</label>
          <div class="input-field input-flex">
            <span data-testid="amount-d">${formattedBill.amount}</span>
            <span>${euroIcon}</span>
          </div>
        </div>
        <div class="col-sm">
          <label for="vat" class="bold-label">TVA</label>
          <div id="vat-flex-container">
            <div class="input-field input-flex vat-flex">
              <span>${formattedBill.vat}</span>
              <span>${euroIcon}</span>
            </div>
            <div class="input-field input-flex vat-flex">
              <span>${formattedBill.pct}</span>
              <span>${pctIcon}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm">
          <label for="file" class="bold-label">Justificatif</label>
          ${
            formattedBill.hasValidFile
              ? `
                <div class="input-field input-flex file-flex">
                  <span id="file-name-admin">${formattedBill.displayFileName || formattedBill.fileName}</span>
                  <div class="icons-container">
                    <span id="icon-eye-d" data-testid="icon-eye-d" data-bill-url="${formattedBill.displayFileUrl}">${eyeWhite}</span>
                  </div>
                </div>
              `
              : `
                <div class="file-error-message">
                  <p>Le fichier n'est pas valide.</p>
                </div>
              `
          }
        </div>
      </div>
      <div class="row">
        ${
          formattedBill.status === "pending"
            ? `
              <div class="col-sm">
                <label for="commentary-admin" class="bold-label">Ajouter un commentaire</label>
                <textarea id="commentary2" class="form-control blue-border" data-testid="commentary2" rows="5"></textarea>
              </div>
            `
            : formattedBill.status === "accepted" || formattedBill.status === "refused"
            ? `
              <div class="col-sm">
                <label for="commentary-admin" class="bold-label">Votre commentaire</label>
                <div class="input-field">${formattedBill.commentAdmin}</div>
              </div>
            `
            : ""
        }
      </div>
      <div class="row">
        ${
          formattedBill.status === "pending"
            ? `
              <div class="col-sm buttons-flex">
                <button type="submit" id="btn-refuse-bill" data-testid="btn-refuse-bill-d" class="btn btn-primary">Refuser</button>
                <button type="submit" id="btn-accept-bill" data-testid="btn-accept-bill-d" class="btn btn-primary">Accepter</button>
              </div>
            `
            : ""
        }
      </div>
      ${modal()}
    </div>
  `;
};
