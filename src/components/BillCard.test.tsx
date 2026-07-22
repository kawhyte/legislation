import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Bill, BillSummaryData } from "@/types";

// The card is only under test for its layout contract per variant. Bookmarking
// pulls in Firebase auth + Firestore, which has its own coverage.
vi.mock("./BookmarkButton", () => ({ default: () => <button>bookmark</button> }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

// The attribution row navigates itself rather than nesting an <a> inside the
// card's link, so the card now needs a router. jsdom has no App Router context.
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

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

describe("BillCard — rep attribution (PLAN-20)", () => {
	const attribution = { sponsorName: "Dana Rivers", repId: "ocd-person/abc", isPrimary: true };

	it("names the sponsoring rep and accents the card", () => {
		const { container } = render(
			<BillCard bill={bill} viewMode='feed' summary={summary} attribution={attribution} />
		);
		expect(screen.getByRole("link", { name: "Dana Rivers sponsored this" })).toBeInTheDocument();
		expect(container.querySelector(".border-accent-yellow")).toBeInTheDocument();
	});

	it("says co-sponsored for a non-primary sponsorship — never 'voted on'", () => {
		render(<BillCard bill={bill} viewMode='feed' attribution={{ ...attribution, isPrimary: false }} />);
		expect(screen.getByRole("link", { name: "Dana Rivers co-sponsored this" })).toBeInTheDocument();
	});

	it("routes to the rep without letting the click reach the card's link", async () => {
		// An <a> inside an <a> is invalid HTML, so the row must be a role=link
		// span that stops propagation and pushes the route itself.
		const user = userEvent.setup();
		const { container } = render(<BillCard bill={bill} viewMode='feed' attribution={attribution} />);
		const row = screen.getByRole("link", { name: "Dana Rivers sponsored this" });
		expect(container.querySelectorAll("a")).toHaveLength(1);

		await user.click(row);
		expect(push).toHaveBeenCalledWith("/rep/ocd-person%2Fabc");

		push.mockClear();
		row.focus();
		await user.keyboard("{Enter}");
		expect(push).toHaveBeenCalledWith("/rep/ocd-person%2Fabc");
	});

	it("renders no attribution row at all when the prop is absent", () => {
		render(<BillCard bill={bill} viewMode='feed' summary={summary} />);
		expect(screen.queryByText(/sponsored this/)).not.toBeInTheDocument();
	});
});
