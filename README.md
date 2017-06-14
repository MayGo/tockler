Tockler
-------

Automatically track applications usage and working time.

- Windows [Download ver 2.4.0](https://github.com/MayGo/tockler/releases/download/v2.4.0/Tockler.Setup.2.4.0.exe) (Tested win 10)
- OS X [Download ver 2.4.4](https://github.com/MayGo/tockler/releases/download/v2.4.4/Tockler-2.4.4.dmg) (Tested El Capitan/Sierra). Needs permission: Security & Privacy -> Accessibility -> enable tockler.app

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

# Tech
- [Electron](https://electron.atom.io/) with [Webpack](https://webpack.github.io/) and [Typescript](https://www.typescriptlang.org/)
- [Aurelia](http://aurelia.io/)
- [D3 v4](https://d3js.org/) and [Britecharts](http://eventbrite.github.io/britecharts/)
- [Bootstrap 4](https://v4-alpha.getbootstrap.com/) and [Modular Admin theme](http://modularcode.io/modular-admin-html/)



![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/timeline_view.png "Tockler screenshot")
![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/timeline_view_table.png "Timeline views table")
![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/select_to_create_log_item.png "Tockler screenshot")
![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/list_view.png "List view")
![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/list_view_selected.png "List view when item selected")
![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/summary_view.png "Summary view")
![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/tray_view.png "Tray view")
![alt text](https://github.com/MayGo/tockler/raw/master/screenshots/tray_view_running_item.png "Tray view when log item running")


# Donations 

This project needs you! If you would like to support this project's further development, feel free to donate. 
Your donation is highly appreciated. Thank you!

Feel free to make feature requests and 'Star' this project.

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=MayGo&url=https://github.com/MayGo/tockler&title=Tockler&language=en_GB&tags=github&category=software)

<a href='https://pledgie.com/campaigns/31267'><img alt='Click here to lend your support to: Tockler and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/31267.png?skin_name=chrome' border='0' ></a>

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAHHBZZCZVDMA)



Development
---
Aurelia: http://aurelia.io/
Aurelia Materialize Bridge: http://aurelia-ui-toolkits.github.io/demo-materialize/
Typescript


### Quick Start
> Prerequisites: [Node](https://nodejs.org/), [Git](https://git-scm.com/).

```bash
git clone https://github.com/Maygo/tockler.git  # Download this project

npm install            # Install dependencies

npm run materialize  # Prepare materialize-css
npm run materializewin # Prepare materialize-css, In windows 

au run --watch # Start application
```


### Aurelia Commands
```bash
# Most Frequently Used
au run --watch     # Run the app in production mode

# Other available commands
au package
au release
```

# signing
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
Copyright (c) 2016 MayGo @ [trimatech.ee](http://trimatech.ee)


