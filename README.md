# ImgBin

[![CodeFactor](https://www.codefactor.io/repository/github/slavyandesu/imgbin/badge)](https://www.codefactor.io/repository/github/slavyandesu/imgbin)
![GitHub repo size](https://img.shields.io/github/repo-size/SlavyanDesu/ImgBin)
![GitHub License](https://img.shields.io/github/license/SlavyanDesu/ImgBin)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fimgbin.vercel.app)

**ImgBin** is a web app that allows users to temporarily upload and manage images. It leverages **Cloudinary** for the storage and uses **NSFWJS** or **Google Vision API** for image moderation.

## Table of Contents

- [ImgBin](#imgbin)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [API Documentation](#api-documentation)
    - [Upload Endpoint](#upload-endpoint)
    - [Delete Endpoint](#delete-endpoint)
    - [Files Endpoint](#files-endpoint)
    - [Cleanup Endpoint](#cleanup-endpoint)
  - [License](#license)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/SlavyanDesu/ImgBin.git
```

2. Navigate to the project directory:

```bash
cd ImgBin
```

3. Install the dependencies:

```bash
npm install
```

4. Set up environment variables:

```
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3000
DATABASE_URL="postgresql://your-neondb:url@ep-cool-darkness-a1b2c3d4-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require"
GOOGLE_APPLICATION_CREDENTIALS="./key/your-gcp-key.json"
MODERATION="nsfwjs"
```

- `MODERATION` can be either `nsfwjs` or `google-vision`.
- If you choose `google-vision`, you must set up a Google Cloud Project, enable the Vision API, and download the service account JSON key.
- Google Cloud Vision API may require billing activation. See [Google's Documentation](https://cloud.google.com/vision/docs/detecting-safe-search) for details.

5. Build the application:

```bash
npm run build
```

- The compiled files will be in `dist/` directory.

## Usage

To start the application, run:

```bash
npm start
```

Visit http://localhost:3000 in your browser to access the app.

## Features

- Temporary image hosting with expiration
- A simple and intuitive UI
- Cookie-based validation for image deletion (only the uploader can delete)
- Responsive design for mobile and desktop
- Image moderation using NSFWJS or Google Cloud Vision API

## Technologies Used

- Node.js
- Express.js
- NSFWJS
- Google Cloud Vision
- Cloudinary
- Prisma ORM
- NeonDB
- TypeScript
- EJS
- GitHub Action

## API Documentation

### Upload Endpoint

- POST `/upload`
- Request Body: Form data containing the file to upload.
- Response example:

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/abcd/image/upload/v1741948827/1741948783559-picture.png",
  "publicId": "1741948783559-picture",
  "message": "File deleted successfully"
}
```

### Delete Endpoint

- DELETE `/delete/:publicId`
- Parameters: `publicId` of the file to delete.
- Response example:

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Files Endpoint

- GET `/files`
- Response: Renders a page displaying uploaded images.

### Cleanup Endpoint

- GET `/api/cleanup?token=YOUR_SECRET_TOKEN`
- Description: Deletes files older than 3 days from both Cloudinary and the database.
- Authorization: Requires a valid token via query parameter `token`.
- Response example (success):

```json
{
  "success": true,
  "message": "Deleted 3 files"
}
```

- Response example (unauthorized):

```json
{
  "message": "Forbidden"
}
```

- Response example (error):

```json
{
  "success": false,
  "message": "An error occurred during cleanup."
}
```

> Note: This endpoint is intended to be triggered programmatically (e.g., via a cron job or GitHub Action). Do not expose your secret token publicly.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
