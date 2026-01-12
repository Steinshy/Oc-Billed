export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("fr", { month: "short" }).format(date);
  const day = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
  const monthFormatted = month.charAt(0).toUpperCase() + month.slice(1);
  return `${parseInt(day)} ${monthFormatted.substring(0, 3)}. ${year.substring(2, 4)}`;
};

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refused";
  }
};

export const validateFileUrl = value => {
  if (value == null || typeof value !== "string") return true;
  const trimmed = value.trim();
  return !trimmed || /^(null|undefined)$|\/(null|undefined)/.test(trimmed);
};

export const formatBillForDisplay = bill => {
  const hasValidFile = !validateFileUrl(bill.fileUrl);
  return {
    ...bill,
    hasValidFile,
    displayFileName: validateFileUrl(bill.fileName) ? "" : bill.fileName,
    displayFileUrl: validateFileUrl(bill.fileUrl) ? "" : bill.fileUrl,
    displayCommentAdmin: validateFileUrl(bill.commentAdmin) ? "" : bill.commentAdmin,
  };
};
