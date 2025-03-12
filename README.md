# TempStorage

[![CodeFactor](https://www.codefactor.io/repository/github/slavyandesu/tempstorage/badge)](https://www.codefactor.io/repository/github/slavyandesu/tempstorage)
![GitHub repo size](https://img.shields.io/github/repo-size/SlavyanDesu/TempStorage)
![GitHub License](https://img.shields.io/github/license/SlavyanDesu/TempStorage)
![Website](https://img.shields.io/website?url=https%3A%2F%2Ftempstorage.vercel.app)
<br>
This project is a web application that allows users to upload and delete images. It leverages Cloudinary for media storage and processing, providing features like file transformations, optimizations, and moderations.

## Table of Contents

- [TempStorage](#tempstorage)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [API Documentation](#api-documentation)
    - [Upload Endpoint](#upload-endpoint)
    - [Delete Endpoint](#delete-endpoint)
    - [Files Endpoint](#files-endpoint)
  - [License](#license)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/SlavyanDesu/TempStorage.git
```

2. Navigate to the project directory:

```bash
cd TempStorage
```

3. Install the depedencies:

```bash
npm install
```

4. Set up environment variables:

```
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
SESSION_SECRET="put-any-secret-code-you-like"
PORT=3000
DATABASE_URL="postgresql://your-neondb:url@ep-cool-darkness-a1b2c3d4-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require"
GOOGLE_APPLICATION_CREDENTIALS="./key/your-gcp-key.json"
MODERATION="nsfwjs"
```
For `MODERATION` value you can choose between `nsfwjs` or `google-vision` as your image detection. Keep in mind that you need to setup your own Cloud Platform Project on GCP and download keys of the project's service account as JSON if you prefer `google-vision`. Check [here](https://cloud.google.com/vision/docs/detecting-safe-search) for details.

1. Build application:

```bash
npm run build
```

## Usage

To start the application, run:

```bash
npm start
```

Visit http://localhost:3000 in your browser to access the application.

## Features

- File upload and management
- Image transformations
- Cookie-based validation for image deletion, ensuring that only the owner of an uploaded image can delete it
- Responsive design for mobile and desktop
- Image moderations

## Technologies Used

- Node.js
- Express.js
- NSFWJS
- Google Cloud Vision
- Cloudinary
- Prisma ORM
- Neon
- TypeScript
- EJS
- HTML/CSS/JavaScript

## API Documentation

### Upload Endpoint

- POST `/upload`
- Request Body: Form data containing the file to upload.
- Response: URL of the uploaded file.

### Delete Endpoint

- DELETE `/delete/:publicId`
- Parameters: `publicId` of the file to delete.
- Response: Success message.

### Files Endpoint

- GET `/files`
- Response: Renders a page displaying uploaded files, including thumbnails and download links.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
