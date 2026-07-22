import { describe, it, expect } from "vitest";
import { formatHook } from "./utils";

describe("formatHook", () => {
	it("returns an empty string for missing input", () => {
		expect(formatHook(undefined)).toBe("");
		expect(formatHook(null)).toBe("");
		expect(formatHook("")).toBe("");
		expect(formatHook("   ")).toBe("");
	});

	// Gemini returns a fragment, not a sentence — raw it reads as a label.
	it("composes a bare fragment into a hook", () => {
		expect(formatHook("homeowners")).toBe("Affects homeowners");
		expect(formatHook("small businesses in rural counties")).toBe(
			"Affects small businesses in rural counties"
		);
	});

	it("strips trailing punctuation and whitespace", () => {
		expect(formatHook("  renters. ")).toBe("Affects renters");
	});

	it("downcases a capitalised fragment so the sentence reads correctly", () => {
		expect(formatHook("Homeowners with a mortgage")).toBe("Affects homeowners with a mortgage");
	});

	// Guards against "Affects affects everyone" when the model returns a sentence.
	it("does not stack a second prefix when the model already wrote one", () => {
		expect(formatHook("affects public school teachers")).toBe("Affects public school teachers");
		expect(formatHook("Affects public school teachers")).toBe("Affects public school teachers");
	});
});
