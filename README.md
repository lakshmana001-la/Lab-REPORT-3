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

---

## Lab 3 Highlights
- **RESTful Endpoints:** Proper noun naming (`/books`) and standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- **Query Parameters:** Supports title search (`search_q`), dynamic multi-column sorting (`order_by`, `order`), price range filtering (`min_price`, `max_price`), and pagination (`limit`, `offset`).
- **Body Validation:** Rejects invalid or missing `title`, `author`, and non-numeric `price` with `400 Bad Request` and descriptive error messages.
- **Consistent Response Format:** Uniform JSON formatting across all success and error responses.
- **Postman Test Suite:** Complete test collection covering success cases, edge cases, and failure scenarios.
- **Screenshots:** Visual proof of working endpoints and database states documented in `lab-03/screenshots/`.
