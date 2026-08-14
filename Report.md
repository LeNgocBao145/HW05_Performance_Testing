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
To make the tests realistic and avoid database caching, the scripts will use the following CSV datasets:
*   **`users.csv`**: Contains `email` and `password` for valid accounts to simulate different users logging in, and potentially trigger lockout behavior during stress/spike tests.
*   **`products.csv`**: Contains `product_id` to randomly select items to view and add to cart.

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
- `users.csv`, `products.csv`: Data-driven datasets for Login and Add to Cart.
- `23127155_Load_20260814.js`: Load scenario. **Listener/View Type:** JSON Summary Report (`summary.json`).
- `23127155_Stress_20260814.js`: Stress scenario. **Listener/View Type:** HTML Dashboard Report (`summary.html`).
- `23127155_Spike_20260814.js`: Spike scenario. **Listener/View Type:** Textual standard output Report (`summary.txt`).

> [!WARNING]
> **Account Lockout Reset (FR-02):** The backend locks an account for 30 seconds after 3 failed login attempts. During Stress and Spike tests, high traffic might trigger this lockout if invalid combinations happen.
> **How to reset between runs:** You must wait at least 30 seconds for the temporary lockout to expire naturally, or restart the `node server.js` process to clear in-memory states before starting the next test scenario.
