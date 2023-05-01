# SquiggleDraw

Generate a scribble drawing on your phone and see a robot draw it live! Each drawing comes with a receipt documenting how it was created. SquiggleDraw uses an AxiDraw and thermal receipt printer controlled from your phone with a web app.

## Webapp

[URL](https://main.d3m6znb1by1y42.amplifyapp.com/?inviteKey=)

## User Guide

Run over ssh (see below)

`python3 rasp_pi/connect_AWS.py`

Run on device

`python3 rasp_pi/lcd_controller.py`

### SSH over VPN

```zsh
# Check tailscale is running
sudo tailscale up

# Find te tailscale ip address:
tailscale ip -4
```

## Close Touchscreen UI

`alt + fn + F4`
