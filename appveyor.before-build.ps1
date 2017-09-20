# Get build path
$path = $env:APPVEYOR_BUILD_FOLDER;

$sign = "`"${env:SIGNTOOL}`"  sign /v /ac .\electron\root.cer";

cmd.exe /c "$sign $path\electron\script\get-foreground-window-title.ps1" ;
cmd.exe /c "$sign $path\electron\script\get-user-idle-time.ps1" ;

exit