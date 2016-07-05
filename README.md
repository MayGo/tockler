Backer Timetracker
---

Application that tracks your time by monitoring your active windows (only titles) and idle time.

- Windows [Download ver 2.0.0](https://github.com/MayGo/backer-timetracker/releases/download/2.0.0/BackerTimetracker.Setup.2.0.0.exe) (Tested win 10)
- OS X [Download ver 2.0.0](https://github.com/MayGo/backer-timetracker/releases/download/2.0.0/BackerTimetracker-2.0.0.dmg) (Tested El Capitan). Needs permission: Security & Privacy -> Accessibility -> enable backer-timetracker.app (Asks for admin password to set )

# Features
- Zoomable/Pannable timechart (d3)
- View application history in timechart
- View state(online, offline, idle) histroy in timechart
- Add work log items with modal window
- Add work log item when selecting timeframe in LogTrackItem lane
- Add work log item from tray window
- Edit work log items. Clicking opens title/color editor. Time can be changed by moving selection handles.
- View work log items in timechart
- View work log summary

# Features to be implemented
- Monitor window titles and remind user to start new log item.
- Remind to take a break
- Group log items (e.g 'Working with timetracker' or 'JIRA-1234')


![alt text](https://github.com/MayGo/backer-timetracker/raw/master/screenshots/timeline.PNG "Backer Timetracker screenshot")


# Donations 

This project needs you! If you would like to support this project's further development, feel free to donate. 
Your donation is highly appreciated. Thank you!

Feel free to make feature requests and 'Star' this project.

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=MayGo&url=https://github.com/MayGo/backer-timetracker&title=Backer-Timetracker&language=en_GB&tags=github&category=software)

<a href='https://pledgie.com/campaigns/31267'><img alt='Click here to lend your support to: Backer Timetracker and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/31267.png?skin_name=chrome' border='0' ></a>

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WWFJ9G2JQE5VW)



Development
---
Project is boilerplated from [https://github.com/chuyik/electron-boilerplate](https://github.com/chuyik/electron-boilerplate)

### Quick Start
> Prerequisites: [Node](https://nodejs.org/), [Git](https://git-scm.com/).

```bash
git clone https://github.com/Maygo/timetracker-electron.git  # Download this project

### Ignore this if you're not behind GFW
export ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/

cd timetracker-electron  # Switch directory
npm install              # Install dependencies
gulp                     # Start application
```

### Gulp Commands
```bash
# Most Frequently Used
gulp dev     # [default] Run the app in debugging mode (Reload automatically)
gulp run     # Run the app in production mode

# Other available commands
gulp serve     # Run the app in debugging mode (Reload with CMD+R/F5)
gulp prebuild  # Package OSX app for predistribution (Mainly for preview)
gulp build     # Package windows and OSX app for distribution
gulp sass      # Compile SASS files
```

### Packaging & Distribution
Remember to install asar via npm before you package the application for the first time.

You could run `npm i asar -g`, and then run `gulp build`.

After built, the dist files should be saved to `output` folder by default.

# License
GNU General Public License v2.0
Copyright (c) 2016 MayGo @ [trimatech.ee](http://trimatech.ee)


