import assert from "node:assert";
import { it, describe } from "node:test";
import request from "supertest";
import app from '../app.js'

describe("GET /payments", () => {
  it("responds with all payments", async () => {
    request(app)
      .get('/api/dashboard/payments')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNlaWZ0YWhhd3k1NEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJ1c2VyX2lkIjoiYTQ4ZDJkMjgtYzRmNC00NGMzLTkzODEtZGIxYjI3N2UzMjA4IiwibmFtZSI6IlNlaWYgSGVzaGFtIFNhbGVtIiwidHlwZSI6NCwiaWF0IjoxNjgxOTUwNjAxLCJleHAiOjE2ODIwMzcwMDF9.QMbr3MmHhQoPslRPrYl3ivN0VlCe27RydzyyZjTnugU')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log(err);
          throw new Error(err);
        }
        console.log(`this is the result ===> `, res.body.data.primary_key);
        assert.equal(res.body.data.primary_key, "payment_id")
      })
  })
})
