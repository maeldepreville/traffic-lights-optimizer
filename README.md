
# Traffic Harmony Orchestrator

A traffic simulation system that models and optimizes traffic flow through intersections.

## Project info

**URL**: https://lovable.dev/projects/a42771a2-60fe-4be3-9bb8-dfcd25fa0bf6

## Getting Started

There are several ways to run this application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and run the application.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Deployment

### GitHub Pages Deployment

This project can be easily deployed to GitHub Pages using the included GitHub Actions workflow.

To deploy to GitHub Pages:

1. Push your code to the `main` branch of your GitHub repository
2. GitHub Actions will automatically build and deploy your app
3. Your app will be available at: `https://[your-username].github.io/[repository-name]/`

### Custom Domain

If you want to use a custom domain with your GitHub Pages deployment:

1. Go to your repository settings
2. Navigate to the "Pages" section
3. Under "Custom domain", enter your domain
4. Follow the instructions to configure your DNS settings

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Integration with other websites

You can embed this simulation in other websites using an iframe:

```html
<iframe 
  src="https://[your-username].github.io/[repository-name]/" 
  width="100%" 
  height="800px" 
  frameborder="0"
  title="Traffic Harmony Orchestrator"
></iframe>
```

