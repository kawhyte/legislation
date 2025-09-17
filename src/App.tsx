import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from '@/hooks/useAuth';
import Header from "./components/Header";
import Hero from "./components/Hero";
import HomepageContent from "./components/HomepageContent";
import DashboardPage from "./pages/DashboardPage";
import TrendingBillsPage from "./pages/TrendingBillsPage";
// import WhyThisMattersPage from "./pages/WhyThisMattersPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { UserProvider, useUserData } from "./contexts/UserContext";
import { Toaster } from "@/components/ui/sonner";

const HomePage = () => {
	// Homepage is now purely presentational - shows Hero, HomepageContent, and TrendingBills
	// Jurisdiction selection for bill viewing is handled through dashboard/navigation
	
	return (
		<div className="bg-background text-foreground">
			<Hero />
			{/* <FeatureCarousel /> */}
			<HomepageContent />
			
			{/* Show trending bills as the main content */}
			{/* <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'> */}
				{/* <TrendingBillsPage /> */}
			{/* </main> */}
			
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
	const { isSignedIn, isLoaded } = useUser();

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
								<HomePage />
							</ProfileSetupChecker>
						) : (
							<HomePage />
						)
					}
				/>
				<Route path='/trending' element={<TrendingBillsPage />} />
				{/* <Route path='/why-this-matters' element={<WhyThisMattersPage />} /> */}
				
				{/* Auth routes */}
				<Route
					path='/sign-in'
					element={
						isSignedIn ? (
							<Navigate to="/dashboard" replace />
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
					path='/dashboard'
					element={
						<ProtectedRoute>
							<ProfileSetupChecker>
								<DashboardPage />
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
				<Toaster />
			</UserProvider>
		</Router>
	);
};

export default App;
