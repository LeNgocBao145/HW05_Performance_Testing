# Performance Testing Report

## Task 1: Tool Selection
**Tool Chosen:** k6
**Reason:** The backend is built with Node.js/JavaScript. k6 provides JS-native scripting, has a lighter footprint, and fits the stack perfectly.

## Task 1: Test Design (Model)

### 1. Endpoint Groups & User Journey
The chosen end-to-end user journey is: **Login** -> **Product Listing** -> **Add to Cart & Checkout**.
This journey perfectly covers all three mandatory endpoint groups and matches the homework requirements:
*   **Auth-heavy:** Login (`POST /api/login`). Exercises authentication and the 3-fail account lockout mechanism (FR-02).
*   **Read-heavy:** Product Listing (`GET /api/products`). Exercises database reads and returning the catalog.
*   **Transactional:** Add to Cart (`POST /api/cart`) and Checkout (`POST /api/checkout`). Exercises write operations, data integrity, and automated total calculation.

### 2. Data-Driven Strategy
To make the tests realistic and avoid database caching, the test data is handled as follows:
*   **`users.csv`**: Contains `email` and `password` for valid accounts to simulate different users logging in. (Requires a one-off script to seed 200 users before the test, and a teardown step to clean them up after the test).
*   **Dynamic Data Correlation (Products)**: Instead of a static `products.csv`, the script dynamically fetches the available products via `GET /api/products` and randomly selects a valid Product ID during runtime for the Add to Cart step.
### 3. Load Shapes and SLOs
The test will evaluate the system under three different profiles using k6. 
*Note: The system requirements (README.md) did not specify explicit Non-Functional Requirements, so these numbers are chosen based on industry standard heuristics for a small-scale Node.js/SQLite application.*

*   **VUs (Virtual Users):** 20 for Load (baseline daily traffic), 100 for Stress (5x Load to test limits), and 200 for Spike (rapid surge).
*   **Ramp-up:** Gradual increase (30s/1m/10s) instead of all-at-once to realistically simulate user behavior and avoid sudden network-level connection resets.
*   **Target SLOs:** `p(95) < 500ms` is a standard Web API baseline; relaxed to `< 1000ms` for Stress scenarios.

| Scenario | VUs (Users) | Ramp-up | Duration | Goal / Justification | Target SLOs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Load** | 20 | 30s | 3m | Normal expected traffic. Validates system behaves well under typical conditions. | 95th percentile response time < 500ms, Error rate < 1%. |
| **Stress** | 100 | 1m | 5m | Peak/abnormal capacity. Identifies memory leaks, DB bottlenecks, or the breaking point. | 95th percentile response time < 1000ms, Error rate < 5%. |
| **Spike** | 200 | 10s | 1m | Sudden traffic surge (e.g., flash sale). Ensures system does not permanently crash and can recover. | System doesn't crash, graceful degradation. |

## Task 1: Script Generation
The k6 scripts and CSV datasets have been generated.

**Files Created:**
- `users.csv`: Data-driven dataset for Login.
- `23127155_Load_20260814.js`: Load scenario. **Listener/View Type:** JSON Summary Report (`summary.json`).
- `23127155_Stress_20260814.js`: Stress scenario. **Listener/View Type:** HTML Dashboard Report (`summary.html`).
- `23127155_Spike_20260814.js`: Spike scenario. **Listener/View Type:** Textual standard output Report (`summary.txt`).

> [!WARNING]
> **Account Lockout Reset (FR-02):** The backend locks an account for 30 seconds after 3 failed login attempts. During Stress and Spike tests, high traffic might trigger this lockout if invalid combinations happen.
> **How to reset between runs:** You must wait at least 30 seconds for the temporary lockout to expire naturally, or restart the `node server.js` process to clear in-memory states before starting the next test scenario.

## Human Review Notes (Step 2 Correction)
*   **What was wrong (Users Data):** The AI initially generated `users.csv` with only 2 accounts (including 1 admin which is invalid for a buyer checkout flow), which is insufficient for 200 VUs. Sharing 1 regular account across 200 VUs would cause severe data conflicts and race conditions (cart sharing) during Transactional endpoints.
*   **Why it missed (Classification):** **Endpoint characteristic** / **Model limitation**. The AI directly copied the two default accounts from `README.md` without considering that transactional endpoints (Cart/Checkout) are tied to individual user sessions. A proper test requires a dataset of unique user accounts matching the number of concurrent VUs.
*   **What was missing (Teardown):** The AI did not advise tearing down (cleaning up) the 200 seeded users after the test run.
*   **Why it missed (Classification):** **Model limitation**. The AI focused only on data preparation but missed the Test Data Management best practice of restoring the environment to its initial state to prevent database bloat.
*   **What was wrong (Static Products):** The AI originally used a static `products.csv` for product IDs.
*   **Why it missed (Classification):** **Model limitation**. The AI generated a static CSV to fulfill the prompt's instruction blindly, rather than applying the best practice of Dynamic Data Correlation (fetching available IDs at runtime) to prevent 404 errors if product records change.
