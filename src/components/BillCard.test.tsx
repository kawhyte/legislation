import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Bill, BillSummaryData } from "@/types";

// The card is only under test for its layout contract per variant. Bookmarking
// pulls in Firebase auth + Firestore, which has its own coverage.
vi.mock("./BookmarkButton", () => ({ default: () => <button>bookmark</button> }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

const BillCard = (await import("./BillCard")).default;

afterEach(cleanup);

const bill = {
	id: "ocd-bill/1",
	identifier: "HB 1",
	title: "AN ACT RELATING TO RESIDENTIAL PROPERTY TAX",
	jurisdiction: { id: "j1", name: "Texas", classification: "state" },
	subject: ["Housing", "Public Health", "Taxation"],
	sponsorships: [{ primary: true, person: { name: "Dana Rivers" } }],
	momentum: { level: "High", score: 40, reasons: [] },
	sources: [],
} as unknown as Bill;

const summary: BillSummaryData = {
	gist: "g",
	whoItAffects: "homeowners in Texas",
	walletImpact: "Could raise the average property tax bill by about $200 a year.",
	controversy: { for: [], against: [] },
};

describe("BillCard — feed variant", () => {
	it("leads with the impact hook and wallet line, not the legal title", () => {
		render(<BillCard bill={bill} viewMode='feed' summary={summary} />);
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Affects homeowners in Texas");
		expect(screen.getByText(summary.walletImpact)).toBeInTheDocument();
	});

	it("falls back to the sentence-cased title when no summary is cached", () => {
		render(<BillCard bill={bill} viewMode='feed' />);
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"An act relating to residential property tax"
		);
	});

	it("shows one status pill, one chip, no stepper and no sponsor line", () => {
		const { container } = render(<BillCard bill={bill} viewMode='feed' summary={summary} />);
		expect(screen.getByText("Moving fast")).toBeInTheDocument();
		expect(screen.queryByText("High Momentum")).not.toBeInTheDocument();
		expect(container.querySelectorAll("span.rounded-full.border-border")).toHaveLength(1);
		expect(screen.queryByText(/Sponsored by/)).not.toBeInTheDocument();
	});
});

describe("BillCard — detailed variant is untouched", () => {
	it("keeps the legal title, the momentum badge, two chips and the sponsor line", () => {
		const { container } = render(<BillCard bill={bill} viewMode='detailed' summary={summary} />);
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"An act relating to residential property tax"
		);
		expect(screen.getByText("High Momentum")).toBeInTheDocument();
		expect(container.querySelectorAll("span.rounded-full.border-border")).toHaveLength(2);
		expect(screen.getByText("Dana Rivers")).toBeInTheDocument();
	});
});
