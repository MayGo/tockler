# Get build path
$path = $env:APPVEYOR_BUILD_FOLDER;

$sign = "signtool sign /v /ac .\appveyor-tockler.cer";

cmd.exe /c "$sign $path\electron\script\get-foreground-window-title.ps1" ;
cmd.exe /c "$sign $path\electron\script\get-user-idle-time.ps1" ;

exit