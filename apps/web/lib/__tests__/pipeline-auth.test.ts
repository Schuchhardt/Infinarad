import { afterEach, describe, expect, it } from "vitest";
import { authorize } from "../pipeline-auth";

const ORIGINAL = process.env["VIDEO_PIPELINE_TOKEN"];

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env["VIDEO_PIPELINE_TOKEN"];
  else process.env["VIDEO_PIPELINE_TOKEN"] = ORIGINAL;
});

function request(headers: Record<string, string> = {}): Request {
  return new Request("https://infinarad.com/api/video/worker", {
    method: "POST",
    headers,
  });
}

describe("pipeline authorize", () => {
  it("refuses to run when no token is configured", () => {
    delete process.env["VIDEO_PIPELINE_TOKEN"];
    const result = authorize(request({ "x-infinarad-token": "anything" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
  });

  it("rejects a wrong token", () => {
    process.env["VIDEO_PIPELINE_TOKEN"] = "correct-horse";
    const result = authorize(request({ "x-infinarad-token": "wrong-horse" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });

  it("rejects a token of a different length without throwing", () => {
    process.env["VIDEO_PIPELINE_TOKEN"] = "correct-horse";
    const result = authorize(request({ "x-infinarad-token": "short" }));
    expect(result.ok).toBe(false);
  });

  it("rejects a missing header", () => {
    process.env["VIDEO_PIPELINE_TOKEN"] = "correct-horse";
    expect(authorize(request()).ok).toBe(false);
  });

  it("accepts the token on either header", () => {
    process.env["VIDEO_PIPELINE_TOKEN"] = "correct-horse";
    expect(authorize(request({ "x-infinarad-token": "correct-horse" })).ok).toBe(true);
    expect(authorize(request({ authorization: "Bearer correct-horse" })).ok).toBe(true);
  });
});
