const request = require("supertest");
const app = require("../app");
const jwt = require("../services/jwt");
const fixtures = require("./fixtures");

const UNAUTHENTICATE_ERROR_TEXT = "unauthenticate error";
const TEST_USER_ID = "73WakrfVbNJBaAmhQtEeDv";
const USERS_PATH = "/users";

const jwtValueAdmin = jwt.encrypt({
  userId: 1,
  email: "john-doe@domain.tld",
});
const jwtValue = jwt.encrypt({
  userId: 2,
  email: "john-wick@domain.tld",
});

describe("Test the root path", () => {
  test("It should response the GET method", () => {
    return request(app).get(USERS_PATH).set("Authorization", `Bearer ${jwtValue}`).expect(200);
  });

  test(`It should return ${UNAUTHENTICATE_ERROR_TEXT} for list user`, () => {
    return request(app).get(`${USERS_PATH}/${TEST_USER_ID}`).expect(401);
  });

  test(`It should return ${UNAUTHENTICATE_ERROR_TEXT} for update user`, () => {
    return request(app).patch(`${USERS_PATH}/${TEST_USER_ID}`).expect(401);
  });

  test(`It should return ${UNAUTHENTICATE_ERROR_TEXT} for delete user`, () => {
    return request(app).delete(`${USERS_PATH}/${TEST_USER_ID}`).expect(401);
  });

  test("It should get a list of users", () => {
    return request(app)
      .get(USERS_PATH)
      .set("Authorization", `Bearer ${jwtValue}`)
      .expect(200)
      .then(response => {
        expect(response.body).toContainEqual({
          id: TEST_USER_ID,
          name: "john-doe",
          type: "Admin",
          email: "john-doe@domain.tld",
          status: "connected",
        });
      });
  });

  test("It should get a specific user", () => {
    return request(app)
      .get(`${USERS_PATH}/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${jwtValue}`)
      .expect(200)
      .then(response => {
        expect(response.body).toEqual({
          id: TEST_USER_ID,
          name: "john-doe",
          type: "Admin",
          email: "john-doe@domain.tld",
          status: "connected",
        });
      });
  });

  test("It should create a user", () => {
    return request(app)
      .post(USERS_PATH)
      .set("Authorization", `Bearer ${jwtValue}`)
      .send({
        name: "john-wick",
        email: "john-wick@domain.tld",
        type: "Admin",
        status: "connected",
        password: "mot-de-pass",
      })
      .set("Accept", "application/json")
      .expect(201);
  });

  test("It should update a user as admin", () => {
    return request(app)
      .patch("/users/73WakrfVbNJBaAmhQtEeDg")
      .set("Authorization", `Bearer ${jwtValueAdmin}`)
      .send({ name: "john-wick-II", type: "Employee" })
      .set("Accept", "application/json")
      .expect(200);
  });

  test("It should update a user as unauthorized", async () => {
    await fixtures.reset();
    return request(app)
      .patch(`${USERS_PATH}/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${jwtValue}`)
      .send({ name: "john-wick-II", type: "Employee" })
      .set("Accept", "application/json")
      .expect(401);
  });

  test("It should delete a user as admin", () => {
    return request(app)
      .delete("/users/73WakrfVbNJBaAmhQtEeDg")
      .set("Authorization", `Bearer ${jwtValueAdmin}`)
      .set("Accept", "application/json")
      .expect(200);
  });

  test("It should not delete a user as unauthorized", async () => {
    await fixtures.reset();
    return request(app)
      .delete(`${USERS_PATH}/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${jwtValue}`)
      .set("Accept", "application/json")
      .expect(401);
  });
});
