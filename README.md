# Backend Development Fundamentals - Course Lab Repository

**Student Name:** MENDA LAKSHMANARAO  
**Registration Number:** 252U1R5100  
**Class & Section:** 313 AI DE 2B  
**Study Level:** UG (Year 2, Term 2)  
**Subject Name:** Backend Development Fundamentals  
**Teacher / Faculty Name:** Mr Yugandhar Gurjalwar  

---

## Repository Overview

This repository contains all laboratory exercises for the Backend Development Fundamentals course, structured as one folder per lab (`lab-01` through `lab-10`):

| Folder | Topic / Module | Description | Status |
| :--- | :--- | :--- | :---: |
| [`lab-01/`](./lab-01/) | **Node.js & Express Server** | Introduction to Node.js HTTP module, Express setup, routing, and 404 handlers. | Completed |
| [`lab-02/`](./lab-02/) | **SQLite Database & CRUD Routes** | SQLite integration with Express, table creation, and basic CRUD API routes. | Completed |
| [`lab-03/`](./lab-03/) | **REST API, Query Parameters, Validation & Debugging** | RESTful `/books` API with `search_q` (LIKE), `order_by`, `order`, `limit`, `offset`, price filtering (`min_price`/`max_price`), body validation (400), correct HTTP status codes (200, 201, 404), and error debugging. | Completed |
| [`lab-04/`](./lab-04/) | **Registration, Login and JWT** | User registration and login with bcrypt password hashing, JWT token generation, SQLite user storage, parameterized queries, and stateless authentication. | Completed |

---

## Lab 4 Highlights
- **User Registration:** Secure signup with bcrypt password hashing and duplicate username prevention.
- **User Login:** Credential verification using `bcrypt.compare()` with appropriate error messages for unknown users and wrong passwords.
- **JWT Authentication:** Stateless token generation with `jsonwebtoken`, payload contains only the username.
- **Security:** Passwords never stored in plain text, never included in JWT payloads, parameterized SQL queries for injection prevention.
- **Screenshots:** Visual proof of working endpoints, database state, and JWT verification documented in `lab-04/screenshots/`.
