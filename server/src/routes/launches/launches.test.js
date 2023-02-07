const request = require("supertest");
const BASE_URL = "http://localhost:8001";
const { mongoConnect,mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async()=>{
    await mongoConnect();
  });

  afterAll(async()=>{
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It Should respond with 200 success", async () => {
      const response = await request(BASE_URL)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      console.log(response);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4,2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "zoot",
    };

    test("It Should respond with 201 created", async () => {
      const response = await request(BASE_URL)
        .post("/v1/launches")
        .send(completeLaunchDate)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchDate.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It Should catch missing required properties", async () => {
      const response = await request(BASE_URL)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
    // test("It Should catch invalid dates", async () => {
    //   const response = await request(BASE_URL)
    //     .post("/v1/launches")
    //     .send(launchDataWithInvalidDate)
    //     .expect("Content-Type", /json/)
    //     .expect(400);

    //   expect(response.body).toStrictEqual({
    //     error: "Invalid Launch Date",
    //   });
    // });

    test("It should catch invalid dates", async () => {
      const response = await request(BASE_URL)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
