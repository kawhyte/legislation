import axios from "axios";
import { stringify } from "qs";

/**
 * All requests go through /api/openstates which proxies to v3.openstates.org
 * and injects the API key server-side — key never reaches the browser.
 */
export default axios.create({
	baseURL: "/api/openstates",
	paramsSerializer: params => {
		return stringify(params, { arrayFormat: 'repeat' })
	}
});
