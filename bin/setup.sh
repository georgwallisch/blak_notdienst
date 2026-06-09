#!/usr/bin/env bash

set -euo pipefail

SCRIPTDIR="$(cd -- "$(dirname -- "$(readlink -f -- "$0")")" && pwd)"
APPDIR="$(realpath "${SCRIPTDIR}/..")"

OWNER=$(stat -c '%U' "${SCRIPTDIR}/..")
GROUP="www-data"
DIRPERM="2775"
FILEPERM="0664"
DIRS=("cache" "log")

echo " ************************"
echo " * BLAK Notdienst Setup *"
echo " ************************"

if [[ $(id -u) -ne 0 ]]; then
	echo "Script must be run as root. Try 'sudo $0'"
	exit 1
fi

for DIR in "${DIRS[@]}"; do
	
    TARGETDIR="${APPDIR}/${DIR}"
    
	if [[ ! -d "${TARGETDIR}" ]]; then
		echo "Verzeichnis ${DIR} existiert nicht. Lege es neu an.."
		mkdir -p "${TARGETDIR}"
	else
		echo "Verzeichnis ${DIR} existiert bereits."	
	fi
	
	echo "Setze Owner ${OWNER}:${GROUP} .."
	chown -R ${OWNER}:${GROUP} "${TARGETDIR}"
	
	echo "Setze Rechte ${DIRPERM} für ${DIR} .."
	chmod ${DIRPERM} "${TARGETDIR}"
	
	echo "Setze Rechte ${FILEPERM} für evtl vorhandene Dateien"

	find "${TARGETDIR}" -type f -exec chmod ${FILEPERM} {} \;
	
	echo
done

echo "fertig!"
echo
