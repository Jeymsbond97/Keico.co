<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**Keice** is a full-stack news platform built with NestJS (backend) and React (frontend). It features a GraphQL API for managing news articles and inquiries, with a modern, responsive web interface.

### Features

- 📰 **News Management** - Create, read, and manage news articles with images and videos
- 📝 **Inquiry System** - Contact form for user inquiries with email notifications
- 🎨 **Modern Frontend** - Beautiful, responsive React application with Tailwind CSS
- 🔄 **GraphQL API** - Efficient data fetching with Apollo Server and Apollo Client
- 📁 **File Uploads** - Support for image and video uploads
- 🗄️ **MongoDB** - NoSQL database for flexible data storage

### Tech Stack

**Backend:**
- NestJS (Node.js framework)
- GraphQL with Apollo Server
- MongoDB with Mongoose
- TypeScript

**Frontend:**
- React 19 with TypeScript
- Apollo Client for GraphQL
- React Router for navigation
- Tailwind CSS for styling
- Vite for build tooling

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Gmail account credentials (for email notifications - optional)

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGO_DEV=mongodb://localhost:27017/keice
PORT=3012
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

3. Start the backend server:
```bash
# development mode (with hot reload)
npm run start:dev

# production mode
npm run start:prod
```

The GraphQL API will be available at `http://localhost:3012/graphql`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_GRAPHQL_URL=http://localhost:3012/graphql
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running Both Servers

To run both backend and frontend simultaneously, you can use two terminal windows or a process manager like `concurrently`:

```bash
# In the root directory
npm install -g concurrently
concurrently "npm run start:dev" "cd frontend && npm run dev"
```

## Project Structure

```
Keice-backend/
├── src/
│   ├── news/           # News module (articles, images, videos)
│   ├── inquery/        # Inquiry/contact form module
│   ├── common/         # Shared utilities, guards, filters
│   └── app.module.ts   # Main application module
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── graphql/    # GraphQL queries
│   │   └── lib/        # Utilities (Apollo Client)
│   └── package.json
└── package.json        # Backend dependencies
```

## API Endpoints

### GraphQL Playground

Visit `http://localhost:3012/graphql` to access the GraphQL Playground where you can:
- Explore the API schema
- Test queries and mutations
- View documentation

### Available Queries

- `findAllNews` - Get all news articles
- `findOneNews(id: String!)` - Get a single news article
- `findAllInqueries` - Get all inquiries (admin)

### Available Mutations

- `createNews(input: CreateNewsInput!, file: Upload, videoFile: Upload)` - Create a news article
- `createInquery(input: CreateInqueryInput!)` - Submit an inquiry
- `imagesUploader(files: [Upload!]!, target: String!)` - Upload multiple images

## Frontend Pages

- **Home** (`/`) - Landing page with hero section and latest news preview
- **News** (`/news`) - List of all news articles
- **News Detail** (`/news/:id`) - Individual news article view
- **Contact** (`/contact`) - Inquiry/contact form

## Development

### Backend Commands

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod

# run tests
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend Commands

```bash
cd frontend

# development
npm run dev

# production build
npm run build

# preview production build
npm run preview
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
