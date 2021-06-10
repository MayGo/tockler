> This project is based on [Tockler](https://github.com/MayGo/tockler)

# Application installers

| Operating System        | Download                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Windows (32 and 64-bit) | <a href='https://github.com/GitStartHQ/DevTime/releases/download/v0.2.1/GitStart-DevTime-Setup-0.2.1.exe'><img alt='Get it on Windows' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeWindows.png'/></a> |
| macOS                   | <a href='https://github.com/GitStartHQ/DevTime/releases/download/v0.2.1/GitStart-DevTime-0.2.1.dmg'><img alt='Get it on macOS' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeMacOS.png'/></a>           |
| Linux                   | <a href='https://github.com/GitStartHQ/DevTime/releases/download/v0.2.1/devtime_0.2.1_amd64.deb'><img alt='Get it on Linux' width="134px" src='https://github.com/MayGo/tockler/raw/master/badges/BadgeLinux.png'/></a>           |

# Made with

-   [Electron](https://electron.atom.io/) with [Webpack](https://webpack.github.io/) and [Typescript](https://www.typescriptlang.org/)
-   [React](https://reactjs.org/)
-   [D3 v4](https://d3js.org/) and [Victory Chart](http://formidable.com/open-source/victory/docs/victory-chart/)
-   [Ant Design](https://ant.design/)

# Debugging

## Logs

By default, devtime writes logs to the following locations:

on Linux: `~/.config/devtime/logs/main.log`

on macOS: `~/Library/Logs/devtime/main.log`

on Windows: `%USERPROFILE%\AppData\Roaming\devtime\logs\main.log`

## Development

### Quick Start

> Prerequisites: [Node](https://nodejs.org/), [Git](https://git-scm.com/).

```bash
git clone https://github.com/GitStartHQ/DevTime.git  # Download this project

npm install yarn -g     # install yarn or binary from https://yarnpkg.com
```

### Start application

Renderer and main process builds have been separated. It's easier to boilerplate this project and switch client framework.

#### React client (renderer)

```
cd client/
yarn install            # Install dependencies
npm start
```

#### Electron (main)

```
cd electron/
yarn install            # Install dependencies
yarn start
```

Build scripts samples are in travis/appveyor files.

# Signing

https://4sysops.com/archives/sign-your-powershell-scripts-to-increase-security/'
in powershell as admin

```
$cert = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
Set-AuthenticodeSignature -FilePath '.\app\get-foreground-window-title.ps1' -Certificate $cert
```

# License

GNU General Public License v2.0
2021 MayGo (https://github.com/MayGo)

# Functionality

-   On app launch only tray window runs. Main window does not open.
-   Main window opens from tray windows arrow or by reopening application.

# Errors

## while installing electron deps: electron-builder Error: Unresolved node modules: ref

Quick fix: ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true yarn
