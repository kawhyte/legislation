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
- **State Management**: React Context (BookmarkContext for bill bookmarks)
- **External APIs**: OpenStates API v3 for legislation data, Google Gemini AI for bill summaries
- **Data Storage**: localStorage for bookmarks

### Key Architectural Patterns

**Component Structure**: Uses shadcn/ui pattern with reusable UI components in `src/components/ui/`

**API Integration**: 
- OpenStates API client in `src/services/api-client.ts` with query string serialization
- Gemini AI service in `src/services/geminiServices.ts` with caching and rate limiting
- Custom hooks (`useBills`, `useBillSummary`) for data fetching

**Type Safety**: Comprehensive TypeScript types in `src/types/index.ts` including `Bill`, `Jurisdiction`, `Action`, `Vote` interfaces

**Routing Structure**:
- `/` - Homepage with Hero section and either jurisdiction-specific bills or trending bills
- `/saved` - User's bookmarked bills
- `/trending` - National trending legislation  
- `/why-this-matters` - Educational content page

### Key Features

**Bill Tracking**: Real-time momentum analysis with custom `MomentumLevel` scoring system based on legislative actions and timing

**Smart Filtering**: Jurisdiction selector (US states) and topic-based filtering with trending bill detection

**AI Summaries**: Gemini AI generates casual, accessible summaries and impact analysis for bills with intelligent caching

**Bookmark System**: Persistent bill bookmarking with localStorage and React Context

**Responsive Design**: Mobile-first TailwindCSS implementation with custom animations

## Environment Variables

Required environment variables:
- `VITE_OPENSTATES_API_KEY` - OpenStates API key for legislation data
- `VITE_GEMINI_API_KEY` - Google Gemini API key for AI summaries

## Import Aliases

- `@/*` resolves to `./src/*` (configured in tsconfig.json and vite.config.ts)

## Development Notes

**Rate Limiting**: Gemini service has 4-second delays between requests to avoid API limits

**Caching**: AI summaries cached for 24 hours to reduce API calls and improve performance

**Error Handling**: Fallback UI components and graceful degradation for API failures

**Data Persistence**: Bookmarks persist in localStorage with error handling for quota limits