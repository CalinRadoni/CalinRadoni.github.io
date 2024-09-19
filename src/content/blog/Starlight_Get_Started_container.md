---
title: "Get started with Starlight using containers"
description: "Getting started with Starlight, a full-featured documentation theme built on top of the Astro framework, using a Node container with Podman or Docker"
pubDate: 2024-09-19
tags: [ "Starlight", "Astro" ]
---

You do not need to install [Node.js](https://nodejs.org/en) to use [Starlight](https://starlight.astro.build/) . Using `Node.js` from an official container is an easy task.

Compared to initialization of an `Astro` project, for initializing of a `Starlight` project the main requirement is changing the template to `starlight` when running `npm -y create astro`.

A more elegant approach is initializing and developing using scripts.

To initialize a Starlight project just run `create_astro_project.sh` found in `Astro` directory from [github.com/CalinRadoni/Scripts](https://github.com/CalinRadoni/Scripts) repository and **pass the name of a new directory as parameter**.

From the new directory call the scripts as:

- `./scripts/run_dev.sh` to start an `Astro` development server that listen for live file changes in the `src/` directory and updates the site, like the `astro dev` CLI command. Access the server at [http://localhost:4321](http://localhost:4321)
- `./scripts/build.sh` to build the site for production. Use it before pushing your site in production to check for build errors.
- `./scripts/preview_build.sh` starts an `Astro` development server for the site built by `build.sh` script. Access it at [http://localhost:4321](http://localhost:4321)
- `./scripts/update_node_astro_packages.sh` to update the `Node.js` container, the packages and the `Astro` framework.

If you want more information check the [Get started with Astro using containers](/blog/astro_get_started_container) article.

## Links

- [Starlight Docs](https://starlight.astro.build/)
- [Astro Docs](https://docs.astro.build)
