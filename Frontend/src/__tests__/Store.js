import Store from "../app/Store.js";

const MOCK_JWT_TOKEN = "mock-jwt-token";
const HTTP_LOCALHOST_PORT = "http://localhost:5678";

describe("Given I am using the API Store", () => {
  let originalFetch;
  let originalLocalStorage;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalLocalStorage = global.localStorage;

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
  });

  describe("When I login with valid credentials", () => {
    test("Then it should send POST request to /auth/login without Authorization header", async () => {
      const mockResponse = { jwt: "mock-jwt-token-12345" };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const credentials = JSON.stringify({
        email: "employee@test.com",
        password: "password123",
      });

      const result = await Store.login(credentials);

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/auth/login`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBe(credentials);
      expect(fetchCall[1].headers["Content-Type"]).toBe("application/json");
      expect(fetchCall[1].headers.Authorization).toBeUndefined();
      expect(result.jwt).toBe("mock-jwt-token-12345");
    });

    test("Then it should throw error when login fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid credentials" }),
      });

      const credentials = JSON.stringify({
        email: "wrong@test.com",
        password: "wrong",
      });

      await expect(Store.login(credentials)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("When I fetch the bills list", () => {
    test("Then it should send GET request with JWT Authorization header", async () => {
      const mockBills = [
        { id: "1", amount: 100, date: "2023-01-01" },
        { id: "2", amount: 200, date: "2023-01-02" },
      ];

      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBills),
      });

      const result = await Store.bills().list();

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/bills`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("GET");
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
      expect(fetchCall[1].headers["Content-Type"]).toBe("application/json");
      expect(result).toEqual(mockBills);
      expect(result.length).toBe(2);
    });

    test("Then it should send request without Authorization when JWT is not available", async () => {
      window.localStorage.getItem.mockReturnValue(null);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await Store.bills().list();

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBeUndefined();
    });
  });

  describe("When I create a new bill", () => {
    test("Then it should send POST request with bill data and JWT", async () => {
      const newBill = {
        id: "3",
        amount: 300,
        type: "Transport",
        date: "2023-01-03",
      };

      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(newBill),
      });

      const billData = JSON.stringify(newBill);
      const result = await Store.bills().create({ data: billData });

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/bills`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBe(billData);
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
      expect(fetchCall[1].headers["Content-Type"]).toBe("application/json");
      expect(result).toEqual(newBill);
    });
  });

  describe("When I update an existing bill", () => {
    test("Then it should send PATCH request with bill ID and updated data", async () => {
      const updatedBill = {
        id: "1",
        amount: 150,
        type: "Restaurant",
      };

      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedBill),
      });

      const billData = JSON.stringify(updatedBill);
      const result = await Store.bills().update({
        selector: "1",
        data: billData,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/bills/1`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("PATCH");
      expect(fetchCall[1].body).toBe(billData);
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
      expect(fetchCall[1].headers["Content-Type"]).toBe("application/json");
      expect(result).toEqual(updatedBill);
    });
  });

  describe("When I delete a bill", () => {
    test("Then it should send DELETE request with bill ID", async () => {
      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await Store.bills().delete({ selector: "1" });

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/bills/1`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("DELETE");
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
      expect(result.success).toBe(true);
    });
  });

  describe("When I fetch a specific bill", () => {
    test("Then it should send GET request to /bills/{id}", async () => {
      const mockBill = { id: "1", amount: 100, type: "Transport" };

      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBill),
      });

      const result = await Store.bill("1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/bills/1`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("GET");
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
      expect(result).toEqual(mockBill);
    });
  });

  describe("When I work with users", () => {
    test("Then I can fetch a specific user", async () => {
      const mockUser = {
        id: "user123",
        email: "user@test.com",
        type: "Employee",
      };

      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await Store.user("user123");

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/users/user123`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("GET");
      expect(result).toEqual(mockUser);
    });

    test("Then I can create a new user", async () => {
      const newUser = {
        email: "newuser@test.com",
        type: "Employee",
        name: "New User",
      };

      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(newUser),
      });

      const userData = JSON.stringify(newUser);
      const result = await Store.users().create({ data: userData });

      expect(global.fetch).toHaveBeenCalledWith(
        `${HTTP_LOCALHOST_PORT}/users`,
        expect.any(Object),
      );

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBe(userData);
      expect(result).toEqual(newUser);
    });
  });

  describe("When API returns an error", () => {
    test("Then it should throw an error with the message from response", async () => {
      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Server error occurred" }),
      });

      await expect(Store.bills().list()).rejects.toThrow("Server error occurred");
    });

    test("Then it should handle network errors", async () => {
      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(Store.bills().list()).rejects.toThrow("Network error");
    });
  });

  describe("When I use custom headers", () => {
    test("Then custom headers should be merged with default headers", async () => {
      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await Store.bills().list({
        headers: { "X-Custom-Header": "custom-value" },
      });

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
      expect(fetchCall[1].headers["Content-Type"]).toBe("application/json");
      expect(fetchCall[1].headers["X-Custom-Header"]).toBe("custom-value");
    });

    test("Then noContentType flag should prevent Content-Type header", async () => {
      window.localStorage.getItem.mockReturnValue(MOCK_JWT_TOKEN);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await Store.bills().list({
        headers: { noContentType: true },
      });

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].headers["Content-Type"]).toBeUndefined();
    });
  });
});
