#!/bin/bash

HEARTBEAT_FILE="/run/notdienst/heartbeat"
SERVICE="notdienst-display.service"

CHECK_INTERVAL=30
MAX_AGE=120

# Flapping / Recovery Control
MAX_RESTARTS=5
WINDOW_SECONDS=300        # 5 Minuten Fenster
BACKOFF_BASE=10           # Sekunden
BACKOFF_MAX=300           # 5 Minuten

STATE_FILE="/run/notdienst/watchdog_state"
LOG_FILE="/run/notdienst/notdienst-watchdog.log"

mkdir -p /run/notdienst

log() {
    echo "$(date '+%F %T') $1" | tee -a "$LOG_FILE"
}

get_state() {
    [[ -f "$STATE_FILE" ]] && cat "$STATE_FILE" || echo "INIT"
}

set_state() {
    echo "$1" > "$STATE_FILE"
}

count_recent_restarts() {
    # einfache Heuristik: systemd journal zählt Restarts nicht direkt,
    # wir approximieren über state file + timestamps

    [[ -f /run/notdienst/restart_timestamps ]] || return 0

    NOW=$(date +%s)
    awk -v now="$NOW" -v window="$WINDOW_SECONDS" '
        $1 > now - window {count++}
        END {print count+0}
    ' /run/notdienst/restart_timestamps
}

record_restart() {
    echo "$(date +%s)" >> /run/notdienst/restart_timestamps
}

backoff_sleep() {
    RESTARTS=$(count_recent_restarts)

    DELAY=$((BACKOFF_BASE * (2 ** RESTARTS)))
    if (( DELAY > BACKOFF_MAX )); then
        DELAY=$BACKOFF_MAX
    fi

    log "Backoff active: sleeping ${DELAY}s (restarts in window: $RESTARTS)"
    sleep "$DELAY"
}

log "Watchdog started"

# WAITING FOR FIRST HEARTBEAT
while [[ ! -f "$HEARTBEAT_FILE" ]]; do
    log "Waiting for first heartbeat..."
    sleep "$CHECK_INTERVAL"
done

set_state "NORMAL"

while true; do

    if [[ ! -f "$HEARTBEAT_FILE" ]]; then
        log "Heartbeat missing → waiting"
        sleep "$CHECK_INTERVAL"
        continue
    fi

    LAST=$(cat "$HEARTBEAT_FILE")
    NOW=$(date +%s)
    AGE=$((NOW - LAST))

    if (( AGE > MAX_AGE )); then
        log "Heartbeat stale ($AGE s) → restart triggered"

        # Flapping detection
        record_restart
        RESTARTS=$(count_recent_restarts)

        if (( RESTARTS >= MAX_RESTARTS )); then
            log "DEADMAN MODE ACTIVATED (too many restarts)"

            set_state "DEADMAN"

            # optional: längere Pause oder fallback screen
            sleep 600
            continue
        fi

        set_state "RECOVERY"

        log "Restarting $SERVICE"
        systemctl --user restart "$SERVICE"

        backoff_sleep

        set_state "NORMAL"
    fi

    sleep "$CHECK_INTERVAL"

done