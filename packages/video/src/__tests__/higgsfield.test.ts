import { describe, expect, it } from "vitest";
import { readJobSet } from "../providers/higgsfield";

describe("readJobSet", () => {
  it("is pending while any job is still running", () => {
    const state = readJobSet({
      id: "js_1",
      jobs: [
        { id: "j1", status: "completed", results: { raw: { url: "https://cdn/1.mp4" } } },
        { id: "j2", status: "in_progress" },
      ],
    });
    expect(state.status).toBe("pending");
    expect(state.url).toBeNull();
  });

  it("is ready once every job completed and a url is present", () => {
    const state = readJobSet({
      id: "js_2",
      jobs: [{ id: "j1", status: "completed", results: { raw: { url: "https://cdn/1.mp4" } } }],
    });
    expect(state.status).toBe("ready");
    expect(state.url).toBe("https://cdn/1.mp4");
  });

  it("treats an nsfw verdict as a terminal failure", () => {
    const state = readJobSet({ id: "js_3", jobs: [{ id: "j1", status: "nsfw" }] });
    expect(state.status).toBe("failed");
    expect(state.detail).toContain("nsfw");
  });

  it("fails a completed job that carries no result url", () => {
    const state = readJobSet({
      id: "js_4",
      jobs: [{ id: "j1", status: "completed", results: null }],
    });
    expect(state.status).toBe("failed");
  });

  it("is pending when the job set has no jobs yet", () => {
    const state = readJobSet({ id: "js_5", jobs: [] });
    expect(state.status).toBe("pending");
  });
});
