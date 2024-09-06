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
