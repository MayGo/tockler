<!-- DONATELINKS -->

[![Donate using PayPal](https://github.com/MayGo/tockler/raw/master/badges/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAHHBZZCZVDMA)
[![Sponsor on GitHub](https://github.com/MayGo/tockler/raw/master/badges/GitHub-Badge.svg)](https://github.com/sponsors/maygo/)
[![Become a patron](https://github.com/MayGo/tockler/raw/master/badges/Patreon-Badge.svg)](https://www.patreon.com/Tockler)

<!-- DONATELINKS -->

## [![Release](https://img.shields.io/github/v/release/MayGo/tockler)](https://github.com/MayGo/tockler/releases/latest)

<a href="https://www.producthunt.com/posts/tockler?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-tockler" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=304890&theme=light" alt="Tockler - Automatically track applications usage and working time. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

## ![Tockler](https://github.com/MayGo/tockler/raw/master/screenshots/tockler-logo.png 'Tockler')

**Automatically track applications usage and working time.**

> With Tockler you can go back in time and see what you were working on. You can get information on what apps were used - exactly at what time - and what title the application had at that moment. This is enough to determine how much you did something.

**Track how you spent your time on a computer.**

> Tockler tracks active applications usage and computer state. It records active application titles. It tracks idle, offline, and online state. You can see this data with a nice interactive timeline chart.

**Analyze your computer usage**

> See you total online time today, yesterday, or any other day. In monthly calendar views and with charts.

# Applications installer download

| Operating System        | Download                                                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Windows (32 and 64-bit) | <a href='https://github.com/MayGo/tockler/releases/download/v3.19.11/tockler-3.19.11-setup-win.exe'><img alt='Get it on Windows' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeWindows.png'/></a> |
| macOS                   | <a href='https://github.com/MayGo/tockler/releases/download/v3.19.11/Tockler-3.19.11.dmg'><img alt='Get it on macOS' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeMacOS.png'/></a>               |
| Linux                   | <a href='https://github.com/MayGo/tockler/releases/download/v3.19.11/Tockler-3.19.11.AppImage'><img alt='Get it on Linux' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeLinux.png'/></a>          |

# Feedback

Feel free to make feature requests by creating a issue and 'Star' this project.

# Donations

This project needs your support!

If you find this app useful then feel free to donate. Anything helps to keep this app up to date and always improving.

Thank you!

# Made with

-   [Electron](https://electron.atom.io/) with [Webpack](https://webpack.github.io/) and [Typescript](https://www.typescriptlang.org/)
-   [React](https://reactjs.org/)
-   [D3 v4](https://d3js.org/) and [Victory Chart](http://formidable.com/open-source/victory/docs/victory-chart/)
-   [Chakra UI](https://chakra-ui.com/)

# Screenshots

### Light theme

![Timeline](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-timeline.png 'Timeline')
![Settings](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-settings.png 'Settings')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-summary-calendar.png 'Summary')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-summary-chart.png 'Summary')
![Search](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-search.png 'Search')
![Tray window](https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-tray.png 'Tray window')

### Dark theme

![Timeline](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-timeline.png 'Timeline')
![Settings](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-settings.png 'Settings')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-summary-calendar.png 'Summary')
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-summary-chart.png 'Summary')
![Search](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-search.png 'Search')
![Tray window](https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-tray.png 'Tray window')

Theme by StyleStack.com

## Logs

By default, tockler writes logs to the following locations:

Linux: `~/.config/tockler/logs/main.log`

macOS: `~/Library/Logs/tockler/main.log`

Windows: `%USERPROFILE%\AppData\Roaming\tockler\logs\main.log`

## Development

### Quick Start

> Prerequisites: [Node](https://nodejs.org/), [Git](https://git-scm.com/).

```bash
git clone https://github.com/Maygo/tockler.git  # Download this project

npm install yarn -g     # install yarn or binary from https://yarnpkg.com
```

### Start application

Renderer and main process builds have been separated. It's easier to boilerplate this project and switch client framework.

#### React client (renderer)

```
cd client/
yarn install            # Install dependencies
yarn start
```

#### Electron (main)

```
cd electron/
yarn install            # Install dependencies
yarn start
```

Build scripts samples are in travis/appveyor files.

### Testing MAS build

In electron-builder.yml replace
type: development
provisioningProfile: development.provisionprofile

# Signing

https://4sysops.com/archives/sign-your-powershell-scripts-to-increase-security/'
in powershell as admin

```
$cert = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
Set-AuthenticodeSignature -FilePath '.\app\get-foreground-window-title.ps1' -Certificate $cert
```

# Errors

### while installing electron deps: electron-builder Error: Unresolved node modules: ref

Quick fix: ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true yarn

# License

GNU General Public License v2.0
2021 MayGo (https://github.com/MayGo)
