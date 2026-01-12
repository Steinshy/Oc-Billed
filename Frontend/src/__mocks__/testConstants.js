// Shared test constants

// Dashboard test constants
export const DASHBOARD = {
  BILL_47QAXB_TEST_ID: "open-bill47qAXb6fIm2zOKkLzMro",
  FORM_TEST_ID: "dashboard-form",
  MODAL_FILE_ADMIN_ID: "modaleFileAdmin1",
  ICON_EYE_D_SELECTOR: "#icon-eye-d",
};

// Status constants
export const STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REFUSED: "refused",
};

// Test email constants
export const TEST_EMAILS = {
  EMPLOYEE: "employee@test.com",
  OTHER: "other@test.com",
  ADMIN: "admin@test.com",
};

// Login form test IDs
export const LOGIN = {
  FORM_EMPLOYEE_TEST_ID: "form-employee",
  FORM_ADMIN_TEST_ID: "form-admin",
  EMPLOYEE_EMAIL_INPUT_TEST_ID: "employee-email-input",
  EMPLOYEE_PASSWORD_INPUT_TEST_ID: "employee-password-input",
  ADMIN_EMAIL_INPUT_TEST_ID: "admin-email-input",
  ADMIN_PASSWORD_INPUT_TEST_ID: "admin-password-input",
};

// NewBill test constants
export const NEW_BILL = {
  EMPLOYEE_TYPE: "Employee",
  FORM_TEST_ID: "form-new-bill",
  TEST_EMAIL: "test@test.com",
  TEST_FILE_URL: "https://localhost:3456/images/test.jpg",
  TEST_FILE_NAME: "test.jpg",
  TEST_BILL_ID: "1234",
};

// Router test constants
export const ROUTER = {
  ACTIVE_ICON_CLASS: "active-icon",
  LAYOUT_ICON1_ID: "layout-icon1",
  LAYOUT_ICON2_ID: "layout-icon2",
  ROOT_ID: "root",
  LOGIN_PAGE_CLASS: "login-page",
  BILLS_PAGE_TITLE: "Mes notes de frais",
};

// Default user for tests
export const DEFAULT_USER = { type: "Employee" };

// Test routes
export const TEST_ROUTES = {
  LOGIN: "/",
  BILLS: "#employee/bills",
  DASHBOARD: "#admin/dashboard",
  UNKNOWN: "#unknown/route",
  OTHER: "/other",
};
