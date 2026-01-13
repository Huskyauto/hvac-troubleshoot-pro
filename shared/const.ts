export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// App branding
export const APP_TITLE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_TITLE) || "HVAC Troubleshoot Pro";
export const APP_LOGO = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_LOGO) || "";
