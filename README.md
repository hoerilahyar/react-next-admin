# Next.js Auth + Dashboard Boilerplate

A minimal boilerplate built with Next.js App Router featuring authentication pages and a protected dashboard.

* `/login` — Login page
* `/register` — Registration page
* `/dashboard` — Protected dashboard (accessible only after login)

  * `/dashboard/analytics`
  * `/dashboard/settings`

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The application will automatically redirect to `/login`.

---

## API Configuration

The backend base URL is configured through an environment variable in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Replace it with your backend API URL.

> The `NEXT_PUBLIC_` prefix is required because this variable is used on the client side (browser), not only on the server.

All API calls are centralized in `lib/api.js` through the `apiFetch` function, which automatically:

* Prepends `NEXT_PUBLIC_API_BASE_URL` to every API path.
* Adds the `Authorization: Bearer <access_token>` header when an access token is available.
* Performs automatic token refresh when the server returns `401 Unauthorized` (expired access token).
* Retries the original request once after a successful token refresh.
* Removes all tokens and redirects the user to `/login` if the refresh token is invalid or expired.
* Prevents multiple simultaneous refresh requests by using a shared promise (refresh deduplication).
* Automatically synchronizes user roles and permissions after a successful token refresh.
* Returns only the `data` field from the backend response.

### Automatic Token Refresh

When an access token expires:

1. `apiFetch` automatically sends a request to `POST /auth/refresh` using the stored `refresh_token`.
2. The newly issued access token and refresh token are saved to `localStorage`.
3. The original API request is retried automatically.
4. If token refresh fails, the user session is cleared and the user is redirected to `/login`.

If multiple requests receive `401 Unauthorized` at the same time, only one refresh request is sent. Other requests will wait until the refresh process completes.

---

## Automatic Role & Permission Synchronization

Whenever an access token is refreshed:

* The `user` object returned by `/auth/refresh` (including `roles` and `permissions`) is stored again in `localStorage`.
* An `auth:session-refreshed` event is broadcast.
* `AuthProvider` (`lib/auth-context.js`) listens for this event and updates the React state automatically.

This means that changes to a user's roles or permissions in the backend are automatically reflected in the frontend without requiring the user to log out and log back in.

The maximum delay is one access token refresh cycle (`expires_in` seconds), provided that the backend refresh endpoint fetches the latest roles and permissions from the database instead of simply re-signing existing token claims.

---

## Backend Response Format

The backend response is assumed to follow this structure:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

`apiFetch` automatically returns the contents of the `data` property to the caller.

---

## Authentication Endpoints

The following endpoints are expected:

```text
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
GET  /me
```

### Login

```http
POST /auth/login
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

---

### Register

```http
POST /auth/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password"
}
```

> Adjust the payload if your backend uses a different registration schema.

---

### Refresh Token

```http
POST /auth/refresh
```

Request body:

```json
{
  "refresh_token": "..."
}
```

---

### Logout

```http
POST /auth/logout
```

---

### Get Current User

```http
GET /me
```

This endpoint is automatically called whenever:

* The application is opened.
* The page is refreshed.

It is used to:

* Validate the access token.
* Retrieve the latest user information.
* Synchronize roles and permissions.

The response is assumed to follow:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "roles": [],
    "permissions": []
  }
}
```

Adjust the implementation if your backend returns a different response structure.

You may also enable periodic polling through `ME_POLL_INTERVAL_MS` in `lib/auth-context.js` if you want role and permission changes to be reflected sooner than the token refresh interval.

---

## Expected Authentication Response

The `/auth/login` and `/auth/refresh` endpoints are expected to return:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": 1,
      "name": "...",
      "roles": [],
      "permissions": []
    }
  }
}
```

---

## Project Structure

```text
app/
  (auth)/
    login/page.js
    register/page.js

  dashboard/
    layout.js              # Route protection + sidebar + navbar
    page.js                # Dashboard overview
    analytics/page.js
    settings/page.js

  layout.js                # Root layout (wraps AuthProvider)
  page.js                  # Redirects to /login

components/
  Sidebar.js
  Navbar.js
  ProtectedRoute.js

lib/
  auth-context.js          # Authentication state using localStorage

styles/
  globals.css              # Minimal styling, ready to be replaced
```

---

## Mock Authentication

`lib/auth-context.js` provides a simple authentication context that stores the session in `localStorage`.

This implementation is intended only for development and demonstration purposes.

Before deploying to production, replace the `login`, `register`, and `logout` functions with a real authentication provider such as:

* REST API
* NextAuth.js
* Firebase Authentication
* Supabase Auth
* Clerk
* Auth0
* Custom JWT authentication

---

## Integrating a ThemeForest Template

### 1. Copy Static Assets

Copy the template's static assets (CSS, images, fonts, icons, etc.) into the `public/` directory.

---

### 2. Import Template Styles

If the template provides standard CSS files (not React components), import them inside `app/layout.js` below `globals.css`, or directly within the relevant pages.

---

### 3. Replace Authentication Pages

Replace the markup inside:

```text
app/(auth)/login/page.js
app/(auth)/register/page.js
```

with the login and registration forms from your template.

Make sure to preserve:

* `onSubmit`
* `name`
* `value`
* `onChange`

so that the authentication logic continues to work properly.

---

### 4. Replace Dashboard Components

Replace the following components with the template's dashboard layout:

```text
components/Sidebar.js
components/Navbar.js
```

Be sure to keep:

```jsx
<Link href="...">
```

for navigation and the logout button that calls:

```jsx
logout()
```

from:

```jsx
useAuth()
```

---

### 5. Customize Dashboard Pages

Replace the placeholder dashboard pages with the widgets and components provided by your template:

```text
app/dashboard/page.js
app/dashboard/analytics/page.js
app/dashboard/settings/page.js
```

Examples:

* Statistics cards
* Charts
* Tables
* Reports
* Activity feeds
* Custom widgets

---

### 6. Remove Placeholder Styles

Gradually remove the placeholder styles inside:

```text
styles/globals.css
```

as the template's styles take over.

---

## Adding New Dashboard Pages

To create a new protected dashboard page, simply add a folder inside `app/dashboard/`.

Example:

```text
app/dashboard/users/page.js
```

Since every page under `app/dashboard/` is wrapped by `app/dashboard/layout.js`, it automatically inherits:

* Route protection
* Sidebar
* Navbar
* Shared dashboard layout

No additional setup is required.
