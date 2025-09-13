# Firebase & Clerk Integration Setup Guide

## Overview
This guide will help you complete the Firebase authentication integration with Clerk to enable secure database access.

## What's Already Done
✅ Created Firebase security rules (`firestore.rules`)
✅ Set up Firebase project configuration (`firebase.json`, `firestore.indexes.json`)  
✅ Updated code to use Clerk tokens for Firebase authentication
✅ Build successful with no TypeScript errors

## Steps to Complete Setup

### 1. Configure Firebase Admin SDK

First, you need to set up Firebase Admin SDK for custom token authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (keep it secure!)
6. In **Project Settings**, note your:
   - Project ID
   - Service Account Email

### 2. Create Firebase JWT Template in Clerk

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to your project
3. Go to **Integrations** in the sidebar
4. Look for **Firebase** integration (if available) or go to **JWT Templates**
5. If using JWT Templates:
   - Click **New template**
   - Name it: `firebase`
   - Use this configuration (without reserved claims):
   ```json
   {
     "firebase": {
       "identities": {},
       "sign_in_provider": "clerk"
     }
   }
   ```
   **Note**: Don't include `aud` or `iss` - these are reserved claims that Clerk handles automatically.

6. If using Firebase Integration (preferred):
   - Upload your service account JSON file
   - Clerk will auto-configure everything

### 3. Deploy Firebase Rules

**Option A: Using Firebase Console (Recommended if CLI has issues)**

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project (likely named something similar to `bill-hound`)
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from your `firestore.rules` file
5. Click **Publish**

**Option B: Using Firebase CLI (if authentication works)**

```bash
# First, authenticate with Firebase
firebase login

# List available projects to find the correct project ID
firebase projects:list

# Initialize Firebase in your project (if not already done)
firebase init

# Or manually set the project using the correct ID from the list above
firebase use <your-actual-project-id>

# Deploy the security rules
firebase deploy --only firestore:rules

# Deploy indexes (optional but recommended)
firebase deploy --only firestore:indexes
```

**If Firebase CLI has authentication issues:**
- Try: `firebase logout` then `firebase login` again
- Or use the Firebase Console method above
- The CLI version (7.14.0) might be outdated - consider updating with `npm install -g firebase-tools`

### 4. Test the Integration

Once deployed, your Firebase security rules will:

- ✅ Allow authenticated Clerk users to access their own data
- ✅ Prevent users from accessing other users' data  
- ✅ Validate Clerk user ID format (`user_*`)
- ✅ Secure both user profiles and saved bills collections

The security rules enforce:
- Users can only read/write documents where `request.auth.uid` matches the `userId`
- Clerk user ID format validation (`user_*`)  
- Proper document ownership validation

## Security Rules Summary

Your `firestore.rules` file contains these protections:

```javascript
// Users can only access their own profile
match /users/{userId} {
  allow read, write: if isOwner(userId) && isValidClerkUserId(userId);
  
  // Users can only access their own saved bills
  match /savedBills/{billId} {
    allow read, write: if isOwner(userId) && isValidClerkUserId(userId);
  }
}

// Deny access to all other documents
match /{document=**} {
  allow read, write: if false;
}
```

## Troubleshooting

**If you get authentication errors:**
1. Verify the Clerk Firebase integration is properly configured
2. Ensure the JWT template name matches exactly: `integration_firebase`
3. Check that your Firebase project ID is correct in the environment variables

**If you get permission errors:**
1. Verify the security rules have been deployed
2. Check that the user is properly authenticated with Clerk
3. Ensure the Clerk user ID format starts with `user_`

## Testing Checklist

After setup, test these scenarios:
- ✅ Authenticated users can save bills
- ✅ Authenticated users can view their saved bills  
- ✅ Authenticated users can update their profile
- ✅ Unauthenticated requests are denied
- ✅ Users cannot access other users' data

Your Firebase database is now secure and properly integrated with Clerk authentication!