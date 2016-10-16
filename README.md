Tockler
-------

Automatically track applications usage and working time.

- Windows [Download ver 2.1.0](https://github.com/MayGo/tockler/releases/download/v2.1.0/Tockler.Setup.2.1.0.exe) (Tested win 10)
- OS X [Download ver 2.2.0](https://github.com/MayGo/tockler/releases/download/v2.2.0/Tockler-2.2.0.dmg) (Tested El Capitan/Sierra). Needs permission: Security & Privacy -> Accessibility -> enable tockler.app (Asks for admin password to set )

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
Project is boilerplated from [https://github.com/chuyik/electron-boilerplate](https://github.com/chuyik/electron-boilerplate)

### Quick Start
> Prerequisites: [Node](https://nodejs.org/), [Git](https://git-scm.com/).

```bash
git clone https://github.com/Maygo/tockler.git  # Download this project

cd tockler  # Switch directory
npm install              # Install dev dependencies
Two package.json structure as is recommended in electron-builder: https://github.com/electron-userland/electron-builder#two-packagejson-structure
cd app
npm install            # Install dependencies
bower install
gulp                     # Start application
```
### Compiling sqlite3
cd ./node_modules/sqlite3
npm install nan@~2.3.3
npm run prepublish
node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/node-v48-darwin-x64
node-gyp rebuild --target=1.2.5 --arch=x64 --target_platform=darwin --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/node-v48-darwin-x64

rename folder binding/node-v48-darwin-x64 to electron-v1.2-darwin-x64

#### Other way win
npm run rebuild-sqlite-win
rmdir .\app\node_modules\sqlite3 /s
xcopy .\node_modules\sqlite3 .\app\node_modules\sqlite3 /s /e /h

#### Other way osx
npm run rebuild-sqlite-osx


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



# License
GNU General Public License v2.0
Copyright (c) 2016 MayGo @ [trimatech.ee](http://trimatech.ee)


