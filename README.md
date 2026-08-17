| No. | Criteria | Grade | Self-Assessed Grade |
|-----|----------|-------|---------------------|
| 1 | Task 1 — Load testing | 20 | 20 |
| 2 | Task 1 — Stress testing | 20 | 20 |
| 3 | Task 1 — Spike testing | 20 | 20 |
| 4 | Task 2 — AI analysis + misinterpretation hunt (with correct values from raw logs) | 10 | 10 |
| 5 | Task 3 — Continuous Performance Testing proposal (G9.6) | 10 | 10 |
| 6 | Agent Skills | 10 | 10 |
| | **Total** | **100** | **100** |

## Test Summary Report

- **Scenarios Run:** Baseline, Endurance (Soak), Load, Stress, and Spike.
- **Endpoint Groups Covered:**
  - Auth-heavy: Login (`POST /api/login`)
  - Read-heavy: Product Listing (`GET /api/products`)
  - Transactional: Add to Cart (`POST /api/cart`), Checkout (`POST /api/checkout`)
- **Endurance Threshold:** ~35 req/s (sustained at 30 VUs for 10 minutes with 0% error rate, memory stable at ~27.6 MB, p95 160.47 ms).
- **Number of Bugs / Performance Issues:** 0 functional bugs (100% success rate across all tests). 1 performance bottleneck identified (Event Loop/SQLite locking causing p95 latency to degrade under Stress/Spike conditions up to 1.00s).
- **Demo Videos:** 
  - https://youtu.be/DcezuQ75Lj8
  - https://youtu.be/kAbSimIUSdk
  - https://youtu.be/BNNoqQXlxnw