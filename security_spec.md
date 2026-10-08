# Security Specification & Test Protocol

## 1. Data Invariants
1. A user cannot create or update profile data for a different UID.
2. Watchlist records and watch history belong strictly to the authenticated owner (`userId == request.auth.uid`). No cross-user writes or listing allowed.
3. Reviews can be read publicly, but only authenticated users can author reviews.
4. Review authors cannot forge or spoof another user's UID (`userId == request.auth.uid`).
5. Only the review author can update review content or delete their review.
6. Review likes can only be toggled by the user matching the like document ID (`userId == request.auth.uid`).
7. String lengths and types must be strictly bounded to prevent denial of wallet and resource exhaustion.
8. Default-deny catch-all prevents any rogue collection access.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Watchlist Write**: Anonymous client attempting to write to `/users/alice/watchlist/movie1`.
2. **Watchlist Identity Spoofing**: User `bob` writing to `/users/alice/watchlist/movie1` with `userId: "alice"`.
3. **Ghost Field Injection in Watchlist**: User `alice` submitting a watchlist item with malicious ghost field `isAdmin: true`.
4. **History Record ID Poisoning**: Client attempting path traversal or oversized path ID in history item path.
5. **Review Author Spoofing**: User `mallory` submitting a review claiming `userId: "bob"`.
6. **Negative Rating Injection**: Submitting a review with `rating: -5` or `rating: 15`.
7. **Giant Text Attack in Review**: Submitting a review with `content` string exceeding 4,000 characters.
8. **Unauthorized Review Content Edit**: User `charlie` attempting to overwrite `bob`'s review content.
9. **Tampering with Review Author during Update**: Author attempting to alter `userId` on an existing review.
10. **Review Like Spoofing**: User `bob` creating a like at `/reviews/rev1/likes/alice`.
11. **Direct Profile Overwrite of Another User**: Client writing to `/users/victim` without `request.auth.uid == 'victim'`.
12. **Blanket Query Scraping**: Client attempting to execute an unrestricted list query across all `/users`.
