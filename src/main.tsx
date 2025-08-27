// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { BookmarkProvider } from "./contexts/BookmarkContext.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
	
			<BookmarkProvider>
				<App />
			</BookmarkProvider>
	
	</StrictMode>
);