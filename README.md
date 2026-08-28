# LDSS Audit Search UI

Angular 21 standalone application implementing the two supplied functional requirements for:

**LDSS Unemployment Services Inquiry – Audit Search**

## Implemented requirements

### RBAC Login
- Login is the first screen shown to the user.
- The user selects `admin`, `normal`, or `other` and enters a required user ID.
- All three configured roles are authorized for Audit Search in this local mock implementation.
- The authenticated user ID and role are shown in the top-right navigation area.
- Sign out returns the user to the login screen and clears the loaded audit results.

### Audit Search
- Date range with default **current date - 1 day** through **current date**
- Application Name, defaulted to **LDSS Unemployment Services Inquiry**
- User Name search field
- Event Type filters: Read, Create, Update, Delete
- Event Status filters: Success, Failed
- Date-range validation
- Search and Reset actions

### Audit Search Results
- Selectable rows
- Event Date
- Event Time
- User Name
- Event Type
- Event Status
- Application Name
- Business Function
- View action
- Sortable result columns
- Default descending Event Date + Event Time
- Pagination
- Empty-state and loading state

### Audit Record Details
The View action opens a right-side details drawer containing:
- Section 1: Event Details
  - Event Date
  - Event Time
  - User ID
  - User Name
  - Application Name
  - Business Function
  - Event Type
  - Event Status
  - IP Address of User
- Section 2: Server Information
  - Request Data
    - SSN
    - Start Date
    - End Date
  - Response Data
    - Claimant Information
- Both sections are collapsible.

## Mock API

The UI uses `AuditApiService` as a local mock API abstraction. It simulates an HTTP response with a short delay so the UI can be demonstrated independently of a backend.

Replace `AuditApiService.search()` with an actual `HttpClient` call when the backend endpoint is available.

## Run locally

Prerequisites:
- Node.js 24+
- npm

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Open:

```text
http://localhost:4200
```

Production build:

```bash
npm run build
```

## Important TypeScript compatibility note

Angular 21 officially supports TypeScript **>= 5.9.0 and < 6.0.0**. Therefore this project intentionally uses **TypeScript 5.9.3**, not TypeScript 6.0.

Node.js 24 is supported by Angular 21.

If the requirement is strictly **TypeScript 6.x**, the correct supported combination is Angular 22.x + TypeScript 6.x rather than Angular 21 + TypeScript 6.x.

Sources:
- Angular version compatibility: https://angular.dev/reference/versions
- Angular release schedule: https://angular.dev/reference/releases
