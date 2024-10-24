#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

# rebuild client
pushd client
bun run build
popd

# start server
uv run -m hollowknight_dependencies.server
