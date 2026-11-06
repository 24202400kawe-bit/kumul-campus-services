# Kumul Campus Services

A Student and Campus Services mobile app built with **React Native, Expo and SQLite**, written as a teaching case study for third-year university students in Papua New Guinea.

Students register, log in and manage service requests (maintenance, IT support, library assistance, accommodation, security). An administrator manages every request and every user account. All data is stored on the phone, so the app works with no internet connection.

> Kumul University of Technology, its buildings and all "Demo" people are fictional. Emails use the reserved `.example` domain.

## Features

| Area | What it does |
|---|---|
| Accounts | Student registration, login, logout, session remembered between launches, lockout after 5 failed logins |
| Student | Create, view, edit and delete **their own** requests; search; filter by category and status; status history |
| Admin | Dashboard with totals; all requests from all students; change status with a note to the student; delete requests; activate/deactivate users; promote/demote admins |
| Data | SQLite via `expo-sqlite`; foreign keys, CHECK constraints, migrations, sample data |
| Security | PBKDF2-SHA256 password hashes with per-user random salt; parameterized SQL only; permission checks in the data layer |
| UX | Validation messages under each field, delete confirmation, loading, error and empty states, screen-reader labels, 48dp touch targets |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@kumul.example` | `KumulAdmin2026` |
| Student | `kila.demo@kumul.example` | `Student2026` |
| Student | `naomi.demo@kumul.example` | `Student2026` |
| Student (deactivated — shows the blocked-login message) | `tomas.demo@kumul.example` | `Student2026` |

The login screen lists the first three; tap one to fill in the form. Remove that list (`DEMO_ACCOUNTS` in `src/screens/auth/LoginScreen.js`) and the seed accounts before any real use.

## Requirements

* **Node.js 22 LTS** (22.13 or newer). Check with `node -v`.
* A code editor — VS Code is assumed in these notes.
* One of:
  * an **Android phone** with the **Expo Go** app, on the same Wi-Fi network as the computer, or
  * an **Android emulator** (Android Studio → Device Manager), or
  * an iPhone with Expo Go (iOS) / the iOS Simulator (macOS only).

You do **not** need Android Studio to use Expo Go on a real phone.

## Installation

The project targets **Expo SDK 57**, the SDK that `create-expo-app` currently uses and that the store version of Expo Go supports.

```bash
cd kumul-campus-services
npm install
npx expo install --fix
```

`npx expo install --fix` is important: it replaces every Expo-related package with the exact version that matches SDK 57 (`react`, `react-native`, `expo-sqlite`, `expo-crypto`, navigation libraries and so on). Run `npx expo-doctor` afterwards; it should report no problems.

**If `npm install` fails** (for example with an `ERESOLVE` peer-dependency error), use the clean-template route instead, which always produces matching versions:

```bash
npx create-expo-app@latest kumul-campus-services --template blank
cd kumul-campus-services
npx expo install expo-sqlite expo-crypto expo-status-bar @expo/vector-icons \
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context @noble/hashes
```

Then copy `App.js`, `index.js`, `app.json`, `src/`, `tests/` and `docs/` from this folder into the new project (replace the template's files) and add the `"test"` script from this `package.json`.

### Which SDK does my Expo Go support?

Open Expo Go → Settings (or the profile tab) to see its supported SDK. Expo SDK 58 was released in October 2026 and its Expo Go app is rolling out to the stores; once your Expo Go only supports SDK 58, upgrade the project with:

```bash
npx expo install expo@^58.0.0 --fix
```

The app code uses only stable APIs (`SQLiteProvider`, `useSQLiteContext`, `runAsync`, `getAllAsync`, React Navigation 7), so no code changes are expected.

## Running the app

```bash
npx expo start
```

* **Physical phone (Expo Go):** scan the QR code with Expo Go (Android) or the Camera app (iOS). Phone and computer must be on the same network. On campus Wi-Fi that blocks device-to-device traffic, use a phone hotspot, or run `npx expo start --tunnel` (needs internet).
* **Android emulator:** start the emulator, then press `a` in the terminal. Expo CLI installs the correct Expo Go on the emulator automatically.
* **iOS Simulator (macOS):** press `i`.

Press `r` in the terminal to reload, `j` to open the debugger.

The first launch creates the database and sample data, so it may show "Preparing the campus database…" for a moment.

### Resetting the data

The database lives inside the app's storage. To start again with fresh sample data: Android → long-press Expo Go → App info → Storage → **Clear storage** (or uninstall/reinstall your own build). This deletes all accounts and requests created on that device.

## Working offline

* All features use the on-device SQLite database and never call the network.
* Icons come from `@expo/vector-icons`, which is bundled with the app. The app uses system fonts.
* **In Expo Go during development**, the JavaScript is served by your computer over the local network, so the phone needs to reach the computer (Wi-Fi or hotspot), but not the internet. To start the dev server with no internet at all: `EXPO_OFFLINE=1 npx expo start` (PowerShell: `$env:EXPO_OFFLINE=1; npx expo start`).
* **For a truly standalone, installed app** (no computer needed), build an APK:
  * with EAS (cloud build, needs internet and a free Expo account once): `npm install -g eas-cli`, `eas login`, then `eas build -p android --profile preview`. The included `eas.json` makes the `preview` profile produce an installable **APK**; download it to the phone and install it; or
  * locally (needs Android Studio + JDK): `npx expo run:android --variant release`.

  After installation the app works fully offline.

## Device-testing checklist

Run through this on at least one real Android phone (ideally a low-cost model):

1. First launch shows the loading screen, then Login.
2. Log in as Kila → see 4 requests. Search "wifi", filter by *Maintenance*, filter by *Closed* → counts update; "Clear filters" works.
3. Create a request with an empty form → each field shows its error. Fill it in → it appears at the top of the list.
4. Open it → Edit → change the title → Save → the detail and list show the change.
5. Delete it → confirmation dialog → Cancel keeps it; Delete removes it.
6. Open the closed "Water tank" request → Edit button replaced by the "closed" note.
7. Log out → Android back button does not return to the list.
8. Wrong password 5 times for Naomi → lockout message. (Wait 5 minutes or clear storage.)
9. Log in as Tomas → "deactivated" message.
10. Register a new student → you land on an empty "My requests" list with a "New request" button.
11. Log in as admin → dashboard totals; change a request to *In progress* with a note → log in as that student and see the note in "Updates from Campus Services".
12. Admin → Users: try to deactivate yourself (not offered), promote Kila, deactivate a student; that student can no longer log in.
13. Close and reopen the app → you are still logged in.
14. Turn on airplane mode in a release build → everything still works.
15. Accessibility: turn on TalkBack and Android's largest font size; check that every button is announced and nothing is cut off.
16. Keyboard: on the New request form, the description and location fields stay visible while typing.

## Automated checks

```bash
npm test
```

Runs 19 tests with Node's built-in test runner against a **real SQLite engine** (`node:sqlite`, Node 22.13+). They cover validation, filtering and counting, the schema (foreign keys, CHECK, cascade), SQL injection attempts, password hashing, login/lockout/registration, request CRUD, ownership rules and admin user management. A small loader (`tests/support/`) lets Node run the app's own source files and substitutes Node equivalents for `expo-crypto` and `@noble/hashes`. Screens are not covered by these tests — use the checklist above.

`npx expo lint` sets up ESLint with Expo's recommended rules the first time you run it.

## Project structure

```
App.js                       providers: SafeArea, SQLite, Auth, Navigation
index.js                     entry point (registerRootComponent)
src/
  config/constants.js        roles, statuses, limits, hashing settings
  theme/theme.js             colours, spacing, font sizes
  database/
    schema.js                CREATE TABLE statements and relationships
    migrate.js               version check, create + seed on first launch
    seed.js                  fictional sample users, categories, requests
  repositories/              ALL SQL lives here (one file per table/topic)
    userRepository.js  requestRepository.js  categoryRepository.js  sessionRepository.js
  services/
    passwordHasher.js        PBKDF2 hashing and verification
    authService.js           register, login, lockout, session, logout
  utils/                     PURE functions: validation, filters, dates, permissions, errors
  context/AuthContext.js     who is logged in (useAuth hook)
  hooks/                     useFocusedQuery, useCategories
  components/                reusable UI: AppButton, TextField, ChipSelector, RequestList ...
  navigation/RootNavigator.js  auth / student / admin navigators
  screens/
    auth/      Login, Register
    student/   MyRequests, RequestDetail, RequestForm
    admin/     AdminDashboard, AdminRequests, AdminRequestDetail, AdminUsers
    shared/    Profile
tests/                       Node tests + SQLite adapter and shims
docs/
  TEACHING_GUIDE.md          concepts mapped to files, suggested lesson plan
  AUTH_AND_SECURITY.md       limitations of local auth, production design
  EXERCISES.md               graded student exercises
```

## Troubleshooting

| Problem | Fix |
|---|---|
| "Project is incompatible with this version of Expo Go" | The project SDK and Expo Go SDK differ. See *Which SDK does my Expo Go support?* |
| Phone cannot connect to the dev server | Same Wi-Fi? Try a phone hotspot, `npx expo start --tunnel`, or allow Node through the Windows firewall. |
| `Unable to resolve module ...` | Run `npx expo install --fix`, then `npx expo start -c` (clears the bundler cache). |
| Login feels slow on an old phone | Expected — password hashing is deliberately slow (see `PASSWORD_HASH.ITERATIONS`). |
| Want fresh sample data | Clear the app's storage (see *Resetting the data*). |
| `npm test` says `node:sqlite` not found | Upgrade to Node 22.13+. |

## Documentation

* [Teaching guide](docs/TEACHING_GUIDE.md)
* [Authentication and security notes](docs/AUTH_AND_SECURITY.md) — **read before reusing this code for anything real**
* [Student exercises](docs/EXERCISES.md)
