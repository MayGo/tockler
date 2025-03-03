# Tockler

<p align="center">
  <a href="https://tockler.io/#gh-light-mode-only">
    <img src="https://github.com/MayGo/tockler/raw/master/screenshots/tockler-logo-light.svg" width="318px" alt="Tockler logo" />
  </a>
  <a href="https://tockler.io/#gh-dark-mode-only">
    <img src="https://github.com/MayGo/tockler/raw/master/screenshots/tockler-logo-dark.svg" width="318px" alt="Tockler logo" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/MayGo/tockler/releases/latest">
    <img src="https://img.shields.io/github/v/release/MayGo/tockler" alt="Release" />
  </a>
  <a href="https://github.com/MayGo/tockler/releases">
    <img src="https://img.shields.io/github/downloads/maygo/tockler/total" alt="Total downloads" />
  </a>
  <a href="https://github.com/MayGo/tockler/releases/latest">
    <img src="https://img.shields.io/github/downloads/maygo/tockler/latest/total" alt="Latest downloads" />
  </a>
</p>

## Overview

Tockler is a free application that automatically tracks your computer usage and working time. It provides detailed insights into:

-   Application usage and window titles
-   Computer state (idle, offline, online)
-   Interactive timeline visualization
-   Daily, weekly, and monthly usage statistics
-   Calendar views and charts

## Features

-   **Time Tracking**: Go back in time and see what you were working on
-   **Application Monitoring**: Track which apps were used and their window titles
-   **Usage Analytics**: View total online time, application usage patterns, and trends
-   **Interactive Timeline**: Visualize your computer usage with an interactive chart
-   **Cross-Platform**: Available for Windows, macOS, and Linux

## Download

<p align="center">
    <a href='https://github.com/MayGo/tockler/releases/download/v3.21.12/tockler-3.21.12-setup-win.exe'><img alt='Get it on Windows' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeWindows.png'/></a>
    <a href='https://github.com/MayGo/tockler/releases/download/v3.21.12/Tockler-3.21.12.dmg'><img alt='Get it on macOS' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeMacOS.png'/></a>
    <a href='https://github.com/MayGo/tockler/releases/download/v3.21.12/Tockler-3.21.12.AppImage'><img alt='Get it on Linux' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeLinux.png'/></a>
</p>

## Screenshots

### Light Theme

![Timeline](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-timeline.png 'Timeline')
![Settings](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-settings.png 'Settings')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-summary-calendar.png 'Summary')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-summary-chart.png 'Summary')
![Search](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-search.png 'Search')
![Tray window](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-tray.png 'Tray window')

### Dark Theme

![Timeline](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-timeline.png 'Timeline')
![Settings](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-settings.png 'Settings')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-summary-calendar.png 'Summary')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-summary-chart.png 'Summary')
![Search](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-search.png 'Search')
![Tray window](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-tray.png 'Tray window')

## Development

### Prerequisites

-   Node.js
-   Git
-   pnpm

### Quick Start

1. Clone the repository:

```bash
git clone https://github.com/Maygo/tockler.git
cd tockler
```

2. Enable pnpm:

```bash
corepack enable pnpm
```

3. Install dependencies and start the application:

For the React client (renderer):

```bash
cd client/
pnpm install
pnpm start
```

For the Electron main process:

```bash
cd electron/
pnpm install
pnpm start
```

### Logs

Logs are stored in the following locations:

-   Linux: `~/.config/tockler/logs/main.log`
-   macOS: `~/Library/Logs/tockler/main.log`
-   Windows: `%USERPROFILE%\AppData\Roaming\tockler\logs\main.log`

## Support Tockler

Tockler is free and open-source software. If you find it useful, please consider supporting its development:

<p align="center">
  <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAHHBZZCZVDMA">
    <img src="https://github.com/MayGo/tockler/raw/master/badges/Donate-PayPal-green.svg" alt="Donate using PayPal" />
  </a>
  <a href="https://github.com/sponsors/maygo/">
    <img src="https://github.com/MayGo/tockler/raw/master/badges/GitHub-Badge.svg" alt="Sponsor on GitHub" />
  </a>
  <a href="https://www.patreon.com/Tockler">
    <img src="https://github.com/MayGo/tockler/raw/master/badges/Patreon-Badge.svg" alt="Become a patron" />
  </a>
</p>

## Feedback

Feel free to:

-   Create issues for feature requests
-   Star this project
-   Share your feedback

## License

Tockler is licensed under the GNU General Public License v2.0. See the [LICENSE](LICENSE) file for details.

MayGo (https://github.com/MayGo)

Created by Maigo Erit @ <a href="https://trimatech.dev" target="_blank">trimatech.dev</a>
