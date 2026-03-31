import React, { Suspense, useState } from "react";
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
import { DemoProvider } from "./contexts/DemoContext";
import { Toaster } from "@/components/ui/sonner";
import type { States } from "./components/JurisdictionSelector";
import { getJurisdictionFromZip } from "./utils/zipToJurisdiction";
import useBills from "./hooks/useBills";
import BillCard from "./components/BillCard";
import BillCardSkeleton from "./components/BillCardSkeleton";
import tumbleweedData from "./assets/Tumbleweed Rolling.json";

const Lottie = React.lazy(() => import("lottie-react"));

const ZipBillResults: React.FC<{ jurisdiction: States; }> = ({ jurisdiction }) => {
	const { data: bills, isLoading } = useBills(jurisdiction, null);

	if (isLoading) {
		return (
			<section className="container-legislation py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => <BillCardSkeleton key={i} />)}
				</div>
			</section>
		);
	}

	if (!bills || bills.length === 0) {
		return (
			<section className="container-legislation py-12 text-center">
				<Suspense fallback={null}>
					<Lottie animationData={tumbleweedData} loop className="w-64 mx-auto" />
				</Suspense>
				<p className="text-muted-foreground mt-4">No bills found for {jurisdiction.name}.</p>
			</section>
		);
	}

	return (
		<section className="container-legislation py-12">
			<h2 className="text-2xl font-bold text-foreground mb-6">
				Bills in {jurisdiction.name}
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{bills.map(bill => (
					<BillCard key={bill.id} bill={bill} showSource showProgressBar viewMode="detailed" />
				))}
			</div>
		</section>
	);
};

const HomePage = () => {
	const [jurisdiction, setJurisdiction] = useState<States | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [searched, setSearched] = useState(false);

	const handleSearch = async (zip: string) => {
		setIsSearching(true);
		setSearched(true);
		const result = await getJurisdictionFromZip(zip);
		setJurisdiction(result);
		setIsSearching(false);
	};

	return (
		<div className="bg-background text-foreground">
			<Hero onSearch={handleSearch} />

			{isSearching && (
				<section className="container-legislation py-12">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => <BillCardSkeleton key={i} />)}
					</div>
				</section>
			)}

			{!isSearching && searched && !jurisdiction && (
				<section className="container-legislation py-12 text-center">
					<p className="text-muted-foreground text-lg">Zip code not found. Please try again.</p>
				</section>
			)}

			{!isSearching && jurisdiction && (
				<ZipBillResults jurisdiction={jurisdiction} />
			)}

			<HomepageContent />
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
				<Route path='/' element={<HomePage />} />
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
				<DemoProvider>
					<AppRoutes />
					<Toaster />
				</DemoProvider>
			</UserProvider>
		</Router>
	);
};

export default App;
