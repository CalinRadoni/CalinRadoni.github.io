#!/bin/bash

if ! command -v podman >/dev/null 2>&1; then
  print 'podman is not installed !\n'
  exit 1
fi

if ! podman image exists docker.io/library/node:lts; then
  podman pull docker.io/library/node:lts
fi

podman run -it --rm \
  -v "${PWD}":/app:Z -w /app \
  --network=host -p 127.0.0.1:4321:4321 \
  node:lts /bin/bash -c 'npx astro telemetry disable && npm run dev'
