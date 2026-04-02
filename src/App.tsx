import React, { Suspense, useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useUser } from '@/hooks/useAuth';
import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutPage from "./pages/AboutPage";
import RepScorecardPage from "./pages/RepScorecardPage";
import DashboardPage from "./pages/DashboardPage";
import TrendingBillsPage from "./pages/TrendingBillsPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { UserProvider, useUserData } from "./contexts/UserContext";
import { DemoProvider } from "./contexts/DemoContext";
import { SearchCacheProvider, useSearchCache } from "./contexts/SearchCacheContext";
import { Toaster } from "@/components/ui/sonner";
import type { States } from "./components/JurisdictionSelector";
import type { Bill } from "./types";
import type { Rep } from "./hooks/useReps";
import useBills from "./hooks/useBills";
import BillCard from "./components/BillCard";
import BillCardSkeleton from "./components/BillCardSkeleton";
import YourRepsWidget from "./components/YourRepsWidget";
import tumbleweedData from "./assets/Tumbleweed Rolling.json";
import { parseLocationInput } from "./utils/zipToJurisdiction";

const Lottie = React.lazy(() => import("lottie-react"));

// ── Pure rendering layer — no fetching, no cache logic ──────────────────────

interface DisplayProps {
	jurisdiction: States;
	bills: Bill[] | null;
	isLoading: boolean;
	cachedReps?: Rep[];
}

const ZipBillResultsDisplay: React.FC<DisplayProps> = ({ jurisdiction, bills, isLoading, cachedReps }) => {
	if (isLoading) {
		return (
			<section className="container-legislation py-12">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					<div className="lg:col-span-3">
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{Array.from({ length: 6 }).map((_, i) => <BillCardSkeleton key={i} />)}
						</div>
					</div>
					<div className="lg:col-span-1 order-first lg:order-last">
						<YourRepsWidget coords={jurisdiction.zipCoords} stateName={jurisdiction.name} cachedReps={cachedReps} />
					</div>
				</div>
			</section>
		);
	}

	if (!bills || bills.length === 0) {
		return (
			<section className="container-legislation py-12">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					<div className="lg:col-span-3 py-4 text-center">
						<div className="max-w-xs mx-auto">
							<Suspense fallback={null}>
								<Lottie animationData={tumbleweedData} loop className="w-full" />
							</Suspense>
							<h3 className="text-xl font-bold text-foreground mt-2">Quiet out here.</h3>
							<p className="text-muted-foreground mt-2 text-sm">
								The {jurisdiction.name} legislature is pretty quiet right now. Try a different zip code!
							</p>
						</div>
					</div>
					<div className="lg:col-span-1 order-first lg:order-last">
						<YourRepsWidget coords={jurisdiction.zipCoords} stateName={jurisdiction.name} cachedReps={cachedReps} />
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="container-legislation py-12">
			<h2 className="text-4xl font-black text-foreground mb-8 border-b-4 border-foreground pb-4">
				Latest Bills in {jurisdiction.name}
			</h2>
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				<div className="lg:col-span-3">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{bills.map(bill => (
							<BillCard key={bill.id} bill={bill} showSource showProgressBar viewMode="detailed" />
						))}
					</div>
				</div>
				<div className="lg:col-span-1 order-first lg:order-last lg:sticky lg:top-6 lg:self-start">
					<YourRepsWidget coords={jurisdiction.zipCoords} stateName={jurisdiction.name} cachedReps={cachedReps} />
				</div>
			</div>
		</section>
	);
};

// ── Fetching layer — hits the API and writes results into the cache ───────────

const ZipBillResultsFetch: React.FC<{ jurisdiction: States }> = ({ jurisdiction }) => {
	const { setJurisdiction, setBills } = useSearchCache();
	const { data: bills, isLoading } = useBills(jurisdiction, null);

	// Register jurisdiction with cache (clears stale bills/reps if jurisdiction changed)
	useEffect(() => {
		setJurisdiction(jurisdiction);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jurisdiction.name, jurisdiction.zipCoords?.lat, jurisdiction.zipCoords?.lng]);

	// Write bills into cache once loaded
	useEffect(() => {
		if (bills && bills.length > 0) setBills(bills);
	}, [bills, setBills]);

	return <ZipBillResultsDisplay jurisdiction={jurisdiction} bills={bills} isLoading={isLoading} />;
};

// ── Smart wrapper — serves from cache or delegates to the fetching layer ──────

const ZipBillResults: React.FC<{ jurisdiction: States }> = ({ jurisdiction }) => {
	const { isMatch, cache } = useSearchCache();
	const cacheHit = isMatch(jurisdiction) && cache.bills.length > 0;

	if (cacheHit) {
		return (
			<ZipBillResultsDisplay
				jurisdiction={jurisdiction}
				bills={cache.bills}
				isLoading={false}
				cachedReps={cache.reps.length > 0 ? cache.reps : undefined}
			/>
		);
	}

	return <ZipBillResultsFetch jurisdiction={jurisdiction} />;
};

// ── Home page — restores last search from ?q= URL param on load ───────────────

const HomePage = () => {
	const [jurisdiction, setJurisdiction] = useState<States | null>(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const didRestore = useRef(false);

	useEffect(() => {
		if (didRestore.current || jurisdiction) return;
		const q = searchParams.get('q');
		if (!q) return;
		didRestore.current = true;
		parseLocationInput(q)
			.then(setJurisdiction)
			.catch(() => setSearchParams({}, { replace: true }));
	// Only run on mount
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="bg-background text-foreground">
			<Hero onSelectState={setJurisdiction} />
			{jurisdiction && <ZipBillResults jurisdiction={jurisdiction} />}
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
				{/* Public routes — no auth redirect; AuthModal handles soft-gating */}
				<Route path='/' element={<HomePage />} />
				<Route path='/about' element={<AboutPage />} />
				<Route path='/trending' element={<TrendingBillsPage />} />
				<Route path='/rep/:repId' element={<RepScorecardPage />} />
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
					<SearchCacheProvider>
						<AppRoutes />
						<Toaster />
					</SearchCacheProvider>
				</DemoProvider>
			</UserProvider>
		</Router>
	);
};

export default App;
