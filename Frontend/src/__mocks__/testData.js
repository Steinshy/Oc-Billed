// Shared test data for bill objects

export const bill = {
  id: "47qAXb6fIm2zOKkLzMro",
  vat: "80",
  fileUrl:
    "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  status: "pending",
  type: "Hôtel et logement",
  commentary: "séminaire billed",
  name: "encore",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2004-04-04",
  amount: 400,
  commentAdmin: "ok",
  email: "a@a",
  pct: 20,
};

export const billAccepted = {
  ...bill,
  status: "accepted",
};

export const billPending = {
  ...bill,
  status: "pending",
};

export const billRefused = {
  ...bill,
  status: "refused",
};

// Single bill array for simple tests (e.g., Logout.js)
export const singleBillArray = [
  {
    id: "47qAXb6fIm2zOKkLzMro",
    vat: "80",
    fileUrl:
      "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    status: "pending",
    type: "Hôtel et logement",
    commentary: "séminaire billed",
    name: "encore",
    fileName: "preview-facture-free-201801-pdf-1.jpg",
    date: "2004-04-04",
    amount: 400,
    commentAdmin: "ok",
    email: "a@a",
    pct: 20,
  },
];
