if (require('remote').getGlobal('shared').isDev)
  require('electron-connect').client.create()
