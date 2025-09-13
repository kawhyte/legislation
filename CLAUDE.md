# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm run dev` - Start development server with hot reload
- `npm run preview` - Preview production build locally

### Building
- `tsc -b && vite build` - Type check and build for production
- `npm run build` - Same as above (via package.json script)

### Code Quality
- `npm run lint` - Run ESLint on TypeScript and TSX files

## Architecture Overview

This is a React legislation tracking application built with:
- **Frontend**: React 19, TypeScript, Vite, React Router
- **Styling**: TailwindCSS v4 with Radix UI components
- **Authentication**: Firebase Auth for user authentication (email/password + social providers)
- **Database**: Firebase Firestore for user data and saved bills
- **State Management**: React Context (UserContext for user state and saved bills)
- **External APIs**: OpenStates API v3 for legislation data, Google Gemini AI for bill summaries

### Key Architectural Patterns

**Component Structure**: Uses shadcn/ui pattern with reusable UI components in `src/components/ui/`

**API Integration**: 
- OpenStates API client in `src/services/api-client.ts` with query string serialization
- Gemini AI service in `src/services/geminiServices.ts` with caching and rate limiting
- Custom hooks (`useBills`, `useBillSummary`) for data fetching

**Type Safety**: Comprehensive TypeScript types in `src/types/index.ts` including `Bill`, `Jurisdiction`, `Action`, `Vote` interfaces

**Routing Structure**:
- `/` - Homepage with Hero section and either jurisdiction-specific bills or trending bills
- `/sign-in` - User authentication (Firebase Auth with email/password and social providers)
- `/sign-up` - User registration (Firebase Auth with email/password and social providers)
- `/profile-setup` - Profile setup for new users (state selection, display name)
- `/saved` - User's saved bills (protected route)
- `/trending` - National trending legislation  
- `/why-this-matters` - Educational content page

### Key Features

**User Authentication**: Firebase Auth-powered user registration, login, and profile management with support for email/password and social providers (Google, GitHub)

**Profile Setup**: New users select their state and display name for personalized experience

**Bill Tracking**: Real-time momentum analysis with custom `MomentumLevel` scoring system based on legislative actions and timing

**Smart Filtering**: Jurisdiction selector (US states) and topic-based filtering with trending bill detection

**AI Summaries**: Gemini AI generates casual, accessible summaries and impact analysis for bills with intelligent caching

**Persistent Bill Saving**: Authenticated users can save bills to Firestore with full offline access to bill data

**Personalized Homepage**: Authenticated users see bills from their selected state by default

**Responsive Design**: Mobile-first TailwindCSS implementation with custom animations

## Environment Variables

Required environment variables:
- `VITE_OPENSTATES_API_KEY` - OpenStates API key for legislation data
- `VITE_GEMINI_API_KEY` - Google Gemini API key for AI summaries
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (usually `your_project_id.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket (usually `your_project_id.appspot.com`)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## Import Aliases

- `@/*` resolves to `./src/*` (configured in tsconfig.json and vite.config.ts)

## Development Notes

**Authentication Flow**: Users are redirected to profile setup after registration, then to their personalized homepage

**Protected Routes**: `/saved` and `/profile-setup` require authentication; unauthenticated users redirected to sign-in

**Data Architecture**: User preferences and saved bills stored in Firestore with clean DTO structure separate from Firebase Auth user objects

**Firestore Security**: Uses Firebase Auth user ID as document ID for user data; saved bills stored in subcollections

**Rate Limiting**: Gemini service has 4-second delays between requests to avoid API limits

**Caching**: AI summaries cached for 24 hours to reduce API calls and improve performance

**Error Handling**: Fallback UI components and graceful degradation for API failures

**State Management**: UserContext manages Firebase Auth state, user preferences, and saved bills with real-time updates