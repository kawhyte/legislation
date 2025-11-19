import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from '@/hooks/useAuth';
import Header from "./components/Header";
import { UserProvider, useUserData } from "./contexts/UserContext";
import { DemoProvider } from "./contexts/DemoContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load route components for better performance
const Hero = lazy(() => import("./components/Hero"));
const HomepageContent = lazy(() => import("./components/HomepageContent"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TrendingBillsPage = lazy(() => import("./pages/TrendingBillsPage"));
const ProfileSetupPage = lazy(() => import("./pages/ProfileSetupPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));

// Loading fallback component
const LoadingFallback = () => (
	<div className="min-h-screen flex items-center justify-center">
		<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
	</div>
);

const HomePage = () => {
	// Homepage is now purely presentational - shows Hero, HomepageContent, and TrendingBills
	// Jurisdiction selection for bill viewing is handled through dashboard/navigation

	return (
		<div className="bg-background text-foreground">
			<Suspense fallback={<LoadingFallback />}>
				<Hero />
				<HomepageContent />
			</Suspense>
		</div>
	);
};

// Protected route wrapper for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isSignedIn, isLoaded } = useUser();

	if (!isLoaded) {
		return <LoadingFallback />;
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
		return <LoadingFallback />;
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
		return <LoadingFallback />;
	}

	return (
		<div className='min-h-screen'>
			<Header />
			<Suspense fallback={<LoadingFallback />}>
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
			</Suspense>
		</div>
	);
};

const App = () => {
	return (
		<ErrorBoundary>
			<Router>
				<UserProvider>
					<DemoProvider>
						<AppRoutes />
						<Toaster />
					</DemoProvider>
				</UserProvider>
			</Router>
		</ErrorBoundary>
	);
};

export default App;
