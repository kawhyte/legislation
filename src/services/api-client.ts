import axios from "axios";

export default axios.create({
	baseURL: "https://v3.openstates.org",
	headers: {
		"X-API-KEY": import.meta.env.VITE_OPENSTATES_API_KEY,
	},
	params: {
		// q: "Budget",
		jurisdiction: "Florida",
		// identifier: "",
		subject:["health care"],
		sort: "updated_desc",
	},
});
