#!/usr/bin/env bash
# Pull-based deploy: fetch the latest "production" release from GitHub and
# switch the pm2 app over to it. Run periodically by a systemd timer.
#
# Layout under $BASE_DIR:
#   shared/.env    secrets, linked into every release
#   releases/<id>  unpacked bundles, the newest $KEEP_RELEASES are kept
#   current        symlink to the release that is running
set -euo pipefail

REPO="${REPO:-trett1004/weather-compare}"
APP_NAME="${APP_NAME:-weather-compare}"
BASE_DIR="${BASE_DIR:-$HOME/weather-compare}"
KEEP_RELEASES="${KEEP_RELEASES:-3}"
ASSET_URL="${ASSET_URL:-https://github.com/$REPO/releases/download/production}"

RELEASES_DIR="$BASE_DIR/releases"
SHARED_ENV="$BASE_DIR/shared/.env"
CURRENT_LINK="$BASE_DIR/current"
DEPLOYED_FILE="$BASE_DIR/.deployed-checksum"
FAILED_FILE="$BASE_DIR/.failed-checksum"

log() { echo "[update] $*"; }

if [[ ! -f "$SHARED_ENV" ]]; then
  log "missing $SHARED_ENV"
  exit 1
fi
mkdir -p "$RELEASES_DIR"

exec 9>"$BASE_DIR/.update.lock"
flock -n 9 || { log "another update is running"; exit 0; }

tmp="$(mktemp -d "$BASE_DIR/.tmp.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

# The release is briefly missing while CI replaces it; just try again next run.
if ! curl -fsSL -o "$tmp/weather-compare.sha256" "$ASSET_URL/weather-compare.sha256"; then
  log "no production build available right now"
  exit 0
fi
checksum="$(cut -d' ' -f1 "$tmp/weather-compare.sha256")"
for seen in "$DEPLOYED_FILE" "$FAILED_FILE"; do
  if [[ -f "$seen" && "$(cat "$seen")" == "$checksum" ]]; then
    exit 0
  fi
done

curl -fsSL -o "$tmp/weather-compare.tar.gz" "$ASSET_URL/weather-compare.tar.gz"
(cd "$tmp" && sha256sum --quiet -c weather-compare.sha256)

mkdir "$tmp/bundle"
tar -xzf "$tmp/weather-compare.tar.gz" -C "$tmp/bundle"
revision="$(cat "$tmp/bundle/REVISION")"
release_dir="$RELEASES_DIR/$(date +%Y%m%d%H%M%S)-${revision:0:7}"
mv "$tmp/bundle" "$release_dir"
ln -s "$SHARED_ENV" "$release_dir/.env"

previous=""
if [[ -L "$CURRENT_LINK" ]]; then
  previous="$(readlink "$CURRENT_LINK")"
fi

port="$(grep -E '^PORT=' "$SHARED_ENV" | tail -n 1 | cut -d= -f2 | tr -d "\"'" || true)"
port="${port:-3000}"

# pm2 may spawn its daemon here, which must not inherit the lock (fd 9).
start_app() {
  pm2 delete "$APP_NAME" >/dev/null 2>&1 9>&- || true
  pm2 start npm --name "$APP_NAME" --cwd "$1" -- start >/dev/null 9>&-
}

healthy() {
  for _ in $(seq 1 20); do
    if curl -fs -o /dev/null "http://127.0.0.1:$port/"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

log "deploying $revision"
start_app "$release_dir"

if ! healthy; then
  log "health check failed for $revision, rolling back"
  echo "$checksum" > "$FAILED_FILE"
  if [[ -n "$previous" ]]; then
    start_app "$previous"
    pm2 save >/dev/null 9>&-
  fi
  rm -rf -- "$release_dir"
  exit 1
fi

ln -sfn "$release_dir" "$CURRENT_LINK"
echo "$checksum" > "$DEPLOYED_FILE"
pm2 save >/dev/null 9>&-

# Release directory names start with a timestamp, so sorting by name is by age.
mapfile -t old_releases < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort | head -n -"$KEEP_RELEASES")
for dir in "${old_releases[@]}"; do
  if [[ "$dir" != "$release_dir" ]]; then
    rm -rf -- "$dir"
  fi
done

log "deployed $revision"
