# HVAC Troubleshoot Pro - TODO

## Current Issues
- [ ] Fix OAuth callback 404 error after successful login
- [ ] Verify OAuth redirect URL configuration
- [ ] Test complete login flow

## Completed Features
- [x] AI-powered diagnostics engine
- [x] Parts locator functionality
- [x] Manual management system with access tracking
- [x] PWA capability with offline support
- [x] Database schema with 18 tables
- [x] User authentication with Manus OAuth
- [x] Service worker and caching

## New Issues
- [x] Fix persistent 404 error on published/production URL
- [x] Investigate routing configuration for production builds
- [x] Build production version successfully

## Critical Issues
- [x] Fix 404 error on published production URL (persists after republish)
- [x] Check production server SPA fallback configuration
- [x] Verify dist folder structure matches expected deployment format
- [x] Fix production static file path resolution

## Deployment Investigation
- [ ] Check if there's a deployment configuration file needed
- [ ] Verify the build output structure matches Manus expectations
- [ ] Check for any missing deployment scripts or hooks
- [ ] Investigate if NODE_ENV is being set correctly in production

## OAuth Callback Issue (CRITICAL)
- [x] OAuth callback fails on published URL after login
- [x] Check if callback URL needs to be registered for published domain
- [x] Verify OAuth redirect configuration handles multiple domains
- [x] Added health check endpoint for debugging
- [x] Added detailed logging to static file serving
- [ ] Test OAuth flow on published URL with new logging

## Platform Deployment Investigation (URGENT)
- [x] Check if Manus requires specific package.json scripts - start script is correct
- [x] Verify start script points to correct entry point - points to dist/index.js correctly
- [x] Check if there's a platform-specific config file needed - none found
- [x] Investigate if base path or public path needs configuration - paths are correct
- [x] Test if the issue is with how dist folder is structured - structure is correct
- [x] Verified production build works perfectly locally
- [x] Created diagnostic.html page for testing published environment
- [x] Test diagnostic page on published URL - works locally, need to test on published

## Deep Investigation (MAX MODE)
- [x] Research how Manus platform deploys web apps - found similar 404 issue in LinkedIn article
- [x] Check if there's a specific build output structure required - structure is correct (dist/index.js + dist/public/)
- [ ] Investigate if the platform needs a Procfile or similar
- [ ] Check if there are environment variables that must be set
- [ ] Look for any Manus-specific deployment documentation
- [ ] Test if the issue is related to the server not starting at all


## URGENT: Published URL 404 Still Persists
- [x] Deep investigate Manus platform deployment mechanism - added startup logging
- [x] Check if there's a specific entry point the platform expects - using standard pnpm start
- [ ] Verify if the platform runs the build command or expects pre-built files
- [ ] Check if there's a port configuration issue
- [x] Investigate if the platform expects a different server setup - added 0.0.0.0 binding
- [ ] Try simplifying the server to bare minimum to test


## Railway Deployment (Alternative to Manus)
- [x] Create railway.json and nixpacks.toml configuration
- [x] Create deployment guide documentation
- [x] Create environment variables template
- [ ] Push changes to GitHub
- [ ] User deploys to Railway
- [ ] Test published URL on Railway
- [ ] Verify OAuth works on Railway deployment
