<!-- README.md of the project when DC Scaffold runs in English. [nofront] / [noback] lines: only without a front / a back end -->
# {{PROJECT_NAME}}

{{STACK_LABEL}}

## Start

1. Double-click `start.bat`, at the root of the project.
2. Type `D` then Enter: everything starts (Docker when needed, the server, the site) and your browser opens.

{{URL_TABLE}}

The other letters of the menu:

- `I`: installs or updates the modules of the project
- `S`: stops Docker
- `R`: rebuilds Docker (useful when something no longer starts)
- `G` / `B` / `A`: prepare the version to put online (depending on the project)

To write the code, open the folder in VS Code: it suggests the extensions recommended for this project, including GitHub Copilot
(the assistant that helps you code, to connect once with your GitHub account).

This file tells where each part of the project is and how to change it. Technical words are explained in the
[small glossary](#small-glossary) at the bottom.

[nofront] This project has no front: it is an API only.
[noback] This project has no back end: it is a simple site, with no data to save. Create a new project with a back end if it grows.

{{GUIDE}}

## Environment files

`.env` and `.env.production` stay on your computer (they hold the passwords); only the `.env.example` files go to Git
(GitHub for example).

## Small glossary

- **Front**: the site, what visitors see in their browser (`frontend/`).
- **Back end / API**: the server that saves and sends back the data (`backend/`). The site talks to it through addresses like `/products`.
- **Docker**: a program that runs MySQL (and PHP) without installing anything else on your computer.
- **Port**: the number at the end of a local address (`localhost:3000`); each program has its own.
- **`.env`**: the settings and passwords of the project. They never leave your computer.
- **Build**: the optimized version of the site, ready to go online.
- **Component**: a reusable piece of a page (a button, a header...), kept in its own file.
