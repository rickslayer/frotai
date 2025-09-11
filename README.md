# Frota.AI - Vehicle Insights Hub

This is a Next.js application bootstrapped with `create-next-app`, designed for vehicle fleet analysis for the auto parts market.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## API Documentation

The application includes a RESTful API for managing data in a MongoDB database. The API is built using Next.js API Routes.

### Base URL

The API endpoints are available under the `/api` path.

### Collections

The API is designed to be generic and can work with any collection. To specify a collection, use its name in the URL. For example, to work with a `vehicles` collection, you would use `/api/vehicles`.

### Endpoints

#### 1. Get All Documents in a Collection

-   **Endpoint:** `GET /api/:collection`
-   **Description:** Retrieves all documents from the specified collection.
-   **Example:** `GET /api/vehicles`
-   **Success Response (200 OK):**
    ```json
    [
      { "_id": "...", "manufacturer": "Fiat", "model": "Palio", ... },
      { "_id": "...", "manufacturer": "Ford", "model": "Ka", ... }
    ]
    ```
-   **Error Response (500 Internal Server Error):**
    ```json
    { "error": "Failed to fetch data" }
    ```

#### 2. Get a Specific Document by ID

-   **Endpoint:** `GET /api/:collection/:id`
-   **Description:** Retrieves a single document from the specified collection by its `_id`.
-   **Example:** `GET /api/vehicles/60d21b4667d0d8992e610c85`
-   **Success Response (200 OK):**
    ```json
    { "_id": "60d21b4667d0d8992e610c85", "manufacturer": "Fiat", "model": "Palio", ... }
    ```
-   **Error Response (404 Not Found):**
    ```json
    { "error": "Document not found" }
    ```
-   **Error Response (500 Internal Server Error):**
    ```json
    { "error": "Failed to fetch document" }
    ```

#### 3. Insert a New Document

-   **Endpoint:** `POST /api/:collection`
-   **Description:** Adds a new document to the specified collection.
-   **Request Body:** A JSON object representing the document.
-   **Example:** `POST /api/vehicles` with body:
    ```json
    { "manufacturer": "Volkswagen", "model": "Golf", "year": 2023, ... }
    ```
-   **Success Response (201 Created):**
    ```json
    { "_id": "...", "manufacturer": "Volkswagen", "model": "Golf", ... }
    ```
-   **Error Response (400 Bad Request):**
    ```json
    { "error": "Invalid data provided" }
    ```
-   **Error Response (500 Internal Server Error):**
    ```json
    { "error": "Failed to create document" }
    ```

#### 4. Update an Existing Document

-   **Endpoint:** `PUT /api/:collection/:id`
-   **Description:** Updates an existing document in the specified collection by its `_id`.
-   **Request Body:** A JSON object containing the fields to be updated.
-   **Example:** `PUT /api/vehicles/60d21b4667d0d8992e610c85` with body:
    ```json
    { "year": 2024 }
    ```
-   **Success Response (200 OK):**
    ```json
    { "_id": "60d21b4667d0d8992e610c85", "year": 2024, ... }
    ```
-   **Error Response (404 Not Found):**
    ```json
    { "error": "Document not found" }
    ```
-   **Error Response (500 Internal Server Error):**
    ```json
    { "error": "Failed to update document" }
    ```

#### 5. Delete a Document

-   **Endpoint:** `DELETE /api/:collection/:id`
-   **Description:** Deletes a document from the specified collection by its `_id`.
-   **Example:** `DELETE /api/vehicles/60d21b4667d0d8992e610c85`
-   **Success Response (200 OK):**
    ```json
    { "message": "Document deleted successfully" }
    ```
-   **Error Response (404 Not Found):**
    ```json
    { "error": "Document not found" }
    ```
-   **Error Response (500 Internal Server Error):**
    ```json
    { "error": "Failed to delete document" }
    ```
