import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from '@/hooks/useAuth';
import BillGrid from "./components/BillGrid";
import Header from "./components/Header";
import { type States } from "./components/JurisdictionSelector";
import Hero from "./components/Hero";
import SavedBillsPage from "./pages/SavedBillsPage";
import TrendingBillsPage from "./pages/TrendingBillsPage";
import WhyThisMattersPage from "./pages/WhyThisMattersPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { UserProvider, useUserData } from "./contexts/UserContext";
import usStates from "./data/usStates";

const HomePage = ({
	selectedJurisdiction,
	setSelectedJurisdiction,
	selectedTopic,
	setSelectedTopic,
}: {
	selectedJurisdiction: States | null;
	setSelectedJurisdiction: (state: States | null) => void;
	selectedTopic: string | null;
	setSelectedTopic: (topic: string | null) => void;
}) => {
	const resultsRef = useRef<HTMLDivElement>(null);

	const handleStateSelect = (state: States | null) => {
		setSelectedJurisdiction(state);
		// Only scroll if a state is selected (not for nationwide view on initial load)
		if (state && resultsRef.current) {
			setTimeout(() => {
				// Timeout ensures the section is rendered before we scroll
				resultsRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);
		}
	};

	return (
		<div className="bg-background text-foreground">
			<Hero
				selectedJurisdiction={selectedJurisdiction}
				setSelectedJurisdiction={handleStateSelect}
				selectedTopic={selectedTopic}
				setSelectedTopic={setSelectedTopic}
			/>
			<main
				ref={resultsRef}
				className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
				{selectedJurisdiction ? (
					<BillGrid
						selectedJurisdiction={selectedJurisdiction}
						selectedTopic={selectedTopic}
						
					/>
				) : (
					<TrendingBillsPage />
				)}
			</main>
			{/* <Footer /> */}
		</div>
	);
};

// Protected route wrapper for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isSignedIn, isLoaded } = useUser();
	
	if (!isLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}
	
	if (!isSignedIn) {
		return <Navigate to="/sign-in" replace />;
	}
	
	return <>{children}</>;
};

// Profile setup checker
const ProfileSetupChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { userPreferences, isLoadingPreferences } = useUserData();
	
	if (isLoadingPreferences) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}
	
	// If user has no preferences or profile setup is not completed, redirect to setup
	if (!userPreferences || !userPreferences.profileSetupCompleted) {
		return <Navigate to="/profile-setup" replace />;
	}
	
	return <>{children}</>;
};

// Main app with routing
const AppRoutes = () => {
	const [selectedJurisdiction, setSelectedJurisdiction] = useState<States | null>(null);
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
	const { isSignedIn, isLoaded } = useUser();
	const { userPreferences } = useUserData();

	// Auto-select user's state if authenticated and has preferences
	React.useEffect(() => {
		if (isSignedIn && userPreferences?.selectedState && !selectedJurisdiction) {
			// Find the state object that matches the user's preference
			const userState = usStates.find(state => state.abbreviation === userPreferences.selectedState);
			if (userState) {
				setSelectedJurisdiction(userState as States);
			}
		}
	}, [isSignedIn, userPreferences, selectedJurisdiction]);

	if (!isLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className='min-h-screen'>
			<Header />
			<Routes>
				{/* Public routes */}
				<Route
					path='/'
					element={
						isSignedIn ? (
							<ProfileSetupChecker>
								<HomePage
									selectedJurisdiction={selectedJurisdiction}
									setSelectedJurisdiction={setSelectedJurisdiction}
									selectedTopic={selectedTopic}
									setSelectedTopic={setSelectedTopic}
								/>
							</ProfileSetupChecker>
						) : (
							<HomePage
								selectedJurisdiction={selectedJurisdiction}
								setSelectedJurisdiction={setSelectedJurisdiction}
								selectedTopic={selectedTopic}
								setSelectedTopic={setSelectedTopic}
							/>
						)
					}
				/>
				<Route path='/trending' element={<TrendingBillsPage />} />
				<Route path='/why-this-matters' element={<WhyThisMattersPage />} />
				
				{/* Auth routes */}
				<Route
					path='/sign-in'
					element={
						isSignedIn ? (
							<Navigate to="/" replace />
						) : (
							<SignInPage />
						)
					}
				/>
				<Route
					path='/sign-up'
					element={
						isSignedIn ? (
							<Navigate to="/profile-setup" replace />
						) : (
							<SignUpPage />
						)
					}
				/>
				
				{/* Protected routes */}
				<Route
					path='/profile-setup'
					element={
						<ProtectedRoute>
							<ProfileSetupPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/saved'
					element={
						<ProtectedRoute>
							<ProfileSetupChecker>
								<SavedBillsPage />
							</ProfileSetupChecker>
						</ProtectedRoute>
					}
				/>
			</Routes>
		</div>
	);
};

const App = () => {
	return (
		<Router>
			<UserProvider>
				<AppRoutes />
			</UserProvider>
		</Router>
	);
};

export default App;
