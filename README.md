![Tockler](https://github.com/MayGo/tockler/raw/master/screenshots/tockler-logo.png "Tockler")
-------

Automatically track applications usage and working time.

- Windows [Download ver 3.0.4](https://github.com/MayGo/tockler/releases/download/v3.0.4/Tockler-Setup-3.0.4.exe)
- OS X [Download ver 3.0.4](https://github.com/MayGo/tockler/releases/download/v3.0.4/Tockler-3.0.4.dmg) 
- Linux [Download ver 3.0.4](https://github.com/MayGo/tockler/releases/download/v3.0.4/Tockler-3.0.4-x86_64.AppImage) 

# Features

- Timeline chart
- Pie charts
- View application usage and online time in timeline and table
- Add log items
- Statistics and summaries
- Remind user to start new log item.
- Group log items (e.g 'Working with tockler' or 'JIRA-1234')

# Features to be implemented

- Remind to take a break

# Made with

- [Electron](https://electron.atom.io/) with [Webpack](https://webpack.github.io/) and [Typescript](https://www.typescriptlang.org/)
- [Aurelia](http://aurelia.io/)
- [D3 v4](https://d3js.org/) and [Britecharts](http://eventbrite.github.io/britecharts/)
- [Bootstrap 4](https://v4-alpha.getbootstrap.com/) and [Modular Admin theme](http://modularcode.io/modular-admin-html/)

# Screenshots

![Timeline](https://github.com/MayGo/tockler/raw/master/screenshots/tockler-timeline.png "Timeline")
![Changing items color](https://github.com/MayGo/tockler/raw/master/screenshots/tockler-change_color.png "Changing items color")
![Settings](https://github.com/MayGo/tockler/raw/master/screenshots/tockler-settings.png "Settings")
![Summary](https://github.com/MayGo/tockler/raw/master/screenshots/tockler-summary.png "Summary")
![Tray window](https://github.com/MayGo/tockler/raw/master/screenshots/tockler-tray.png "Tray window")

# Donations 

This project needs you! If you would like to support this project's further development, feel free to donate. 
Your donation is highly appreciated. Thank you!

Feel free to make feature requests and 'Star' this project.

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=MayGo&url=https://github.com/MayGo/tockler&title=Tockler&language=en_GB&tags=github&category=software)

<a href='https://pledgie.com/campaigns/31267'><img alt='Click here to lend your support to: Tockler and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/31267.png?skin_name=chrome' border='0' ></a>

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAHHBZZCZVDMA)


Development
---

### Quick Start
> Prerequisites: [Node](https://nodejs.org/), [Git](https://git-scm.com/).

```bash
git clone https://github.com/Maygo/tockler.git  # Download this project

npm install yarn -g     # install yarn or binary from https://yarnpkg.com

yarn install            # Install dependencies

nps run # Start application

# or in separate terminals:
nps main
npm renderer

```

# Signing
https://4sysops.com/archives/sign-your-powershell-scripts-to-increase-security/'
in powershell as admin
```
$cert = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
Set-AuthenticodeSignature -FilePath '.\app\get-foreground-window-title.ps1' -Certificate $cert
```
```
Set-AuthenticodeSignature -FilePath '.\app\get-user-idle-time.ps1' -Certificate $cert
```
# License
GNU General Public License v2.0
2017 MayGo @ [trimatech.ee](http://trimatech.ee)


