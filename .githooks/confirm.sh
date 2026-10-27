# No environment-variable approval token is accepted.
confirm_action() {
  if [ ! -t 2 ] || ! { exec 3<>/dev/tty; } 2>/dev/null; then
    printf '%s\n' 'Blocked: commit/push requires a human terminal and explicit confirmation.' >&2
    return 1
  fi
  printf 'Review the operation. Type %s to continue: ' "$1" >&3
  IFS= read -r answer <&3 || return 1
  exec 3>&-
  [ "$answer" = "$1" ] || {
    printf '%s\n' 'Operation canceled: confirmation did not match.' >&2
    return 1
  }
}
