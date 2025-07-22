import React, { useEffect, useState } from "react";
import apiClient from "../services/api-client";

interface Bill {
	id: string;
	title: string;
	// introduced: string
	// status: string
	// summary: string
	// sources: string[]
}

interface FetchBillsResponse {
	results: Bill[];
}

const BillGrid = () => {
	const [bills, setBills] = useState<Bill[]>([]);
	const [error, setError] = useState("");

	useEffect(() => {
		apiClient
			.get<FetchBillsResponse>("/bills", {})
			.then((res) => {
				console.log(res.data.results);

				setBills(res.data.results);
			})
			.catch((err) => {
				setError(err.message);
			});
	}, []);

	return (
		<>
			{error && <div>{error}</div>}

			<div>
				<ul>
					{bills.map((bill) => (
						<li key={bill.id}>{bill.title}</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default BillGrid;
