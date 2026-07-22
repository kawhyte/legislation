import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import BillStatusPill from "./BillStatusPill";
import type { Bill, MomentumLevel } from "@/types";

afterEach(cleanup);

const billWith = (level: MomentumLevel | undefined): Bill =>
	({
		id: "ocd-bill/1",
		identifier: "HB 1",
		title: "A bill",
		momentum: level ? { level, score: 10, reasons: [] } : undefined,
	} as unknown as Bill);

describe("BillStatusPill", () => {
	it.each([
		["Enacted", "Now law"],
		["Passed", "Passed both chambers"],
		["High", "Moving fast"],
		["Medium", "In progress"],
		["Low", "Early stage"],
		["Stalled", "Stalled"],
	] as const)("renders feed copy for %s momentum", (level, label) => {
		render(<BillStatusPill bill={billWith(level)} />);
		expect(screen.getByText(label)).toBeInTheDocument();
	});

	// An "no momentum" badge is noise on a card whose job is the impact hook.
	it("renders nothing for None", () => {
		const { container } = render(<BillStatusPill bill={billWith("None")} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders nothing when the bill carries no momentum at all", () => {
		const { container } = render(<BillStatusPill bill={billWith(undefined)} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("uses semantic tokens, never a hardcoded colour (PLAN-11)", () => {
		render(<BillStatusPill bill={billWith("Enacted")} />);
		const pill = screen.getByText("Now law").parentElement!;
		expect(pill.className).toContain("text-success");
		expect(pill.className).not.toMatch(/#[0-9a-f]{3,6}|\[rgb/i);
	});
});
