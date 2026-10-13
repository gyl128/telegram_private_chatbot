import assert from "node:assert/strict";
import test from "node:test";
import worker from "../worker.js";

const context = { waitUntil() {} };
const baseEnv = {
  BOT_TOKEN: "test-token",
  SUPERGROUP_ID: "-1001234567890",
  TOPIC_MAP: {},
  SECRET_TOKEN: "test-webhook-secret"
};

function makeRequest(secret) {
  const headers = { "content-type": "application/json" };
  if (secret !== undefined) {
    headers["X-Telegram-Bot-Api-Secret-Token"] = secret;
  }
  return new Request("https://worker.example/webhook", {
    method: "POST",
    headers,
    body: "{}"
  });
}

test("rejects webhook requests without the configured secret", async () => {
  const response = await worker.fetch(makeRequest(), baseEnv, context);
  assert.equal(response.status, 401);
});

test("fails closed when the webhook secret is not configured", async () => {
  const { SECRET_TOKEN, ...envWithoutSecret } = baseEnv;
  const response = await worker.fetch(makeRequest("test-webhook-secret"), envWithoutSecret, context);
  assert.equal(response.status, 500);
});

test("rejects webhook requests with the wrong secret", async () => {
  const response = await worker.fetch(makeRequest("wrong-secret"), baseEnv, context);
  assert.equal(response.status, 401);
});

test("accepts webhook requests with the configured secret", async () => {
  const response = await worker.fetch(makeRequest("test-webhook-secret"), baseEnv, context);
  assert.equal(response.status, 200);
});
