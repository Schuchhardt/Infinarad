import { describe, expect, it } from "vitest";
import { estimateSpeechSeconds, validateScript } from "../validate";
import { JobParamsSchema } from "../types";
import type { Brief, JobParams, Shot, VideoScript } from "../types";

const params: JobParams = JobParamsSchema.parse({ durationSec: 30, shotSeconds: 5 });

function brief(overrides: Partial<Brief> = {}): Brief {
  return {
    locale: "en",
    angleSlug: "buddhism",
    question: { id: "q_1", slug: "what-happens-after-death", title: "What happens after death?", summary: "" },
    tradition: null,
    otherTraditions: [],
    concepts: [],
    relatedConcepts: [],
    authors: [],
    works: [],
    practices: [],
    symbols: [],
    citations: [
      {
        id: "cit_1",
        source_title: "Dhammapada",
        source_kind: "primary_text",
        source_author: null,
        source_year: null,
        source_publisher: null,
        source_url: null,
        source_doi: null,
        source_isbn: null,
        source_license: "public_domain",
        source_quotable: true,
        locator: "v. 1",
        claim_text: "Mind precedes all things.",
        quote: "Mind precedes all things.",
      },
    ],
    derivedTraditions: [],
    ...overrides,
  };
}

function shot(index: number, overrides: Partial<Shot> = {}): Shot {
  return {
    index,
    chapter_slug: "opening",
    duration_sec: 5,
    // ~12 words ≈ 5s at the 2.4 words/second estimate; varied so the
    // duplicate-narration check has nothing to catch.
    narration: `Shot ${index} carries these ten further words of plain narration here`,
    on_screen_text: null,
    image_prompt: "A gold-leaf manuscript page lit by a single candle, lapis blue shadows, macro detail",
    motion_prompt: "Dust drifts through the candle light as the page settles",
    camera: "85mm macro, slow push-in",
    transition: "dissolve through candle smoke",
    claim_text: null,
    citation_ids: [],
    ...overrides,
  };
}

function script(overrides: Partial<VideoScript> = {}): VideoScript {
  return {
    title: "What happens after death?",
    hook: "You will die. Every tradition has had to answer what comes next.",
    logline: "A short film on the Buddhist answer.",
    chapters: [
      { slug: "opening", title: "Opening", summary: "The question" },
      { slug: "answer", title: "The answer", summary: "What the tradition says" },
    ],
    shots: [shot(1), shot(2), shot(3), shot(4), shot(5), shot(6)],
    outro: "The question stays open.",
    description: "A documentary from Infinarad.",
    tags: ["death", "buddhism", "philosophy"],
    thumbnail_prompt: "Gold leaf on near-black parchment, a single candle flame, no text",
    sources_used: [],
    ...overrides,
  };
}

describe("validateScript", () => {
  it("accepts a well-formed script", () => {
    const result = validateScript(script(), brief(), params);
    expect(result.errors).toEqual([]);
  });

  it("rejects citation ids that are not in the brief", () => {
    const bad = script({
      shots: [
        shot(1, { claim_text: "The Buddha said so.", citation_ids: ["cit_INVENTED"] }),
        shot(2),
        shot(3),
        shot(4),
        shot(5),
        shot(6),
      ],
    });
    const result = validateScript(bad, brief(), params);
    expect(result.errors.some((e) => e.includes("cit_INVENTED"))).toBe(true);
  });

  it("rejects a claim with no citation when the brief has sources", () => {
    const bad = script({
      shots: [
        shot(1, { claim_text: "Rebirth was taught from the fifth century BCE." }),
        shot(2),
        shot(3),
        shot(4),
        shot(5),
        shot(6),
      ],
    });
    const result = validateScript(bad, brief(), params);
    expect(result.errors.some((e) => e.includes("no citation"))).toBe(true);
  });

  it("flags — but does not reject — uncitable claims when the graph has no sources", () => {
    const uncited = script({
      shots: [
        shot(1, { claim_text: "Rebirth was taught from the fifth century BCE." }),
        shot(2),
        shot(3),
        shot(4),
        shot(5),
        shot(6),
      ],
    });
    const result = validateScript(uncited, brief({ citations: [] }), params);
    expect(result.errors).toEqual([]);
    expect(result.needsSources).toBe(true);
  });

  it("rejects narration that cannot be read inside the shot", () => {
    const tooLong = script({
      shots: [
        shot(1, { narration: Array.from({ length: 60 }, () => "word").join(" ") }),
        shot(2),
        shot(3),
        shot(4),
        shot(5),
        shot(6),
      ],
    });
    const result = validateScript(tooLong, brief(), params);
    expect(result.errors.some((e) => e.includes("narration needs"))).toBe(true);
  });

  it("rejects a shot pointing at a chapter that does not exist", () => {
    const bad = script({
      shots: [shot(1, { chapter_slug: "ghost" }), shot(2), shot(3), shot(4), shot(5), shot(6)],
    });
    const result = validateScript(bad, brief(), params);
    expect(result.errors.some((e) => e.includes("ghost"))).toBe(true);
  });

  it("rejects a script far off the requested runtime", () => {
    const short = script({ shots: [shot(1), shot(2), shot(3)] });
    const result = validateScript(short, brief(), params);
    expect(result.errors.some((e) => e.includes("against a 30s target"))).toBe(true);
  });

  it("rejects a script with far too few shots for its runtime", () => {
    const long = JobParamsSchema.parse({ durationSec: 120, shotSeconds: 5 });
    const result = validateScript(script(), brief(), long);
    expect(result.errors.some((e) => e.includes("shots for a 120s film"))).toBe(true);
  });

  it("rejects duplicate shot indexes", () => {
    const dup = script({
      shots: [shot(1), shot(2), shot(3), shot(4), shot(5), shot(5)],
    });
    const result = validateScript(dup, brief(), params);
    expect(result.errors.some((e) => e.includes("Duplicate"))).toBe(true);
  });
});

describe("estimateSpeechSeconds", () => {
  it("uses a word rate for alphabetic scripts", () => {
    expect(estimateSpeechSeconds("one two three four five six", "en")).toBeCloseTo(2.5, 1);
  });

  it("uses a character rate for Chinese and Japanese", () => {
    expect(estimateSpeechSeconds("生死輪迴無始無終也", "zh")).toBeCloseTo(2, 0);
  });

  it("returns zero for empty narration", () => {
    expect(estimateSpeechSeconds("   ", "en")).toBe(0);
  });
});
