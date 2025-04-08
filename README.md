# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a42771a2-60fe-4be3-9bb8-dfcd25fa0bf6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a42771a2-60fe-4be3-9bb8-dfcd25fa0bf6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

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

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a42771a2-60fe-4be3-9bb8-dfcd25fa0bf6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Integrating with an existing website

### Option 1: Embed as an iframe
After deploying the simulation, you can embed it in your existing website:

```html
<iframe 
  src="https://your-simulation-url.com" 
  width="100%" 
  height="800px" 
  frameborder="0"
  title="Traffic Harmony Orchestrator">
</iframe>
```

### Option 2: Serve from same domain
To serve the simulation from a subdirectory of your main website:

1. Build this project:
```
npm run build
```

2. Copy the contents of the `dist` folder to a subdirectory on your main website (e.g., `/traffic-simulator`).

3. Create an index.html file in your main website directory with a link to the simulation:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>
        <a href="traffic-simulator/index.html">Launch Traffic Simulator</a>
    </p>
    
    <!-- Alternatively, you can embed it directly: -->
    <!-- 
    <h2>Embedded Simulator:</h2>
    <iframe 
        src="traffic-simulator/index.html" 
        width="100%" 
        height="800px" 
        frameborder="0"
        title="Traffic Harmony Orchestrator">
    </iframe>
    -->
</body>
</html>
```

4. Important: Make sure your folder structure looks like this:
```
your-website/
├── index.html              # Your main HTML file with the link
└── traffic-simulator/      # The folder containing the simulator
    ├── index.html          # The simulator's HTML file
    ├── assets/             # The simulator's assets
    └── ...                 # Other simulator files
```

5. For local testing, use a web server like:
   - Python's built-in server: `python -m http.server`
   - Node's http-server: Install with `npm install -g http-server` and run with `http-server`

Make sure your main website's server is configured to serve static files from the subdirectory.
