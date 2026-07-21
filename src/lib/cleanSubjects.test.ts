import { describe, it, expect } from "vitest";
import { cleanSubjects } from "./utils";

describe("cleanSubjects", () => {
	it("returns an empty array for missing or malformed input", () => {
		expect(cleanSubjects(undefined)).toEqual([]);
		expect(cleanSubjects(null)).toEqual([]);
		expect(cleanSubjects([])).toEqual([]);
	});

	it("drops statute-index noise: single letters, punctuation, cross-references", () => {
		const raw = [
			";",
			"A",
			"H",
			"Children — Special educational needs",
			"Hours of labor, see also",
			"School — State aid, see also",
			"Technical college",
		];
		expect(cleanSubjects(raw)).toEqual([
			"Children — Special educational needs",
			"Technical college",
		]);
	});

	it("title-cases all-caps entries but leaves mixed case alone", () => {
		expect(cleanSubjects(["CIVIL PROCEDURE", "Early Childhood Education"])).toEqual([
			"Civil Procedure",
			"Early Childhood Education",
		]);
	});

	it("dedupes case-insensitively and preserves order", () => {
		expect(cleanSubjects(["Housing", "HOUSING", "housing", "Education"])).toEqual([
			"Housing",
			"Education",
		]);
	});

	it("trims whitespace and trailing separators", () => {
		expect(cleanSubjects(["  Public   Health ;", "Taxation,"])).toEqual([
			"Public Health",
			"Taxation",
		]);
	});
});
