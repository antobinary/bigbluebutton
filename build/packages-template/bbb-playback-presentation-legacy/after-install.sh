#!/bin/bash -e

BIGBLUEBUTTON_USER=bigbluebutton

case "$1" in
  configure|upgrade|1|2)

    for dir in 0.81 0.9.0; do
      target=/var/bigbluebutton/playback/presentation/$dir
      if [ -d "$target" ]; then
        chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER "$target"
      fi
    done

    reloadService nginx

  ;;

  failed-upgrade)
    echo "## bbb-playback-presentation-legacy failed to upgrade." >&2
    echo "## The legacy players (0.81, 0.9.0) moved here from bbb-playback-presentation." >&2
    echo "## Upgrade bbb-playback-presentation to the matching version first, then run:" >&2
    echo "##   apt-get install --reinstall bbb-playback-presentation-legacy" >&2
  ;;

  *)
    echo "## postinst called with unknown argument \`$1'" >&2
  ;;
esac
