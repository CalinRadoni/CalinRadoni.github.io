---
title: "Get started with Astro using containers"
description: "Getting started with Astro using a Node container with Podman or Docker"
pubDate: 2024-09-13
updatedDate: 2024-09-19
tags: [ "Astro", "Podman", "Docker", "Node.js" ]
---

You do not need to install `Node.js` to use `Astro`. Using `Node.js` from an official container is an easy task.

This post presents the details about initializing an `Astro` project and some scripts to ease the development.

For less explanations and helper scripts check:

- the [README](https://github.com/CalinRadoni/Scripts/blob/main/Astro/README.md) from the repository where I keep the scripts
- the short description from [Get started with Starlight using containers](/blog/starlight_get_started_container) article

or read on for more details.

*These instructions are valid for `Podman` and `Docker`. If you use Docker just replace `podman` with `docker`.*

## Initialize the project

To initialize a project based on the `blog` template use:

```sh
podman pull docker.io/library/node:lts

mkdir -p AstroTestBlog && cd "$_"

podman run -it --rm \
    -v "${PWD}":/app:Z -w /app \
    node:lts /bin/bash -c 'npm -y create astro@latest . -- --template blog --install --git --typescript strict'
```

Read about [starter templates](https://docs.astro.build/en/install-and-setup/#use-a-theme-or-starter-template) .

## Container ports

To use the Astro's development server, the container ports should be accessible from your host.

Running containers with the option `--network=host` is considered a security risk. To prevent it the `Astro`'s development server should be set to listen on all addresses. Edit the `package.json` file to add the `--host` option for `dev` and `preview` scripts. Those should look like this:

```json
"dev": "astro dev --host",
"preview": "astro preview --host",
```

then, when running the container, map the `Astro`'s development server to the localhost by passing `-p 127.0.0.1:4321:4321` to the `podman run` command. **See the scripts in the next section for details!**

## Scripts

I use scripts **like** the following to develop [https://calinradoni.github.io/](https://calinradoni.github.io/). The most up to date scripts are in the `Astro` directory from [github.com/CalinRadoni/Scripts](https://github.com/CalinRadoni/Scripts) repository.

### Run Astro's development server

This script runs Astro’s development server on [http://localhost:4321/](http://localhost:4321/) . The browser will update as you save changes in your editor.

```bash
#!/bin/bash

if ! command -v podman >/dev/null 2>&1; then
  print 'podman is not installed !\n'
  exit 1
fi

podman run -it --rm \
  -v "${PWD}":/app:Z -w /app \
  -p 127.0.0.1:4321:4321 \
  node:lts /bin/bash -c 'npx astro telemetry disable && npm run dev'
```

### Build the site for deployment

Use this before pushing your site in production to check for build errors.

```bash
#!/bin/bash

if ! command -v podman >/dev/null 2>&1; then
  print 'podman is not installed !\n'
  exit 1
fi

podman run -it --rm \
  -v "${PWD}":/app:Z -w /app \
  node:lts /bin/bash -c 'npx astro telemetry disable && npm run build'
```

### Preview the site built for deployment

Starts a server on [http://localhost:4321/](http://localhost:4321/) to serve the contents created by building the site for deployment.

```bash
#!/bin/bash

if ! command -v podman >/dev/null 2>&1; then
  print 'podman is not installed !\n'
  exit 1
fi

podman run -it --rm \
  -v "${PWD}":/app:Z -w /app \
  -p 127.0.0.1:4321:4321 \
  node:lts /bin/bash -c 'npx astro telemetry disable && npm run preview'
```

### Update Astro, Node and the packages

```bash
#!/bin/bash

if ! command -v podman >/dev/null 2>&1; then
  print 'podman is not installed !\n'
  exit 1
fi

podman pull docker.io/library/node:lts

podman run -it --rm \
  -v "${PWD}":/app:Z -w /app \
  --network=host \
  node:lts /bin/bash -c 'npx astro telemetry disable && npm update && npx @astrojs/upgrade'
```

## Links

- [Astro Docs](https://docs.astro.build/en/getting-started/)
- Astro's [CLI Commands](https://docs.astro.build/en/reference/cli-reference/) on Astro Docs
