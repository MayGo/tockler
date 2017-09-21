# Get build path
$path = $env:APPVEYOR_BUILD_FOLDER;

$certSelfSigned = New-SelfSignedCertificate -DnsName trimatech.ee -CertStoreLocation Cert:\CurrentUser\My -KeyExportPolicy Exportable -Type CodeSigningCert -KeySpec Signature
Set-AuthenticodeSignature -FilePath "$path\electron\scripts\get-foreground-window-title.ps1" -Certificate $certSelfSigned 
Set-AuthenticodeSignature -FilePath "$path\electron\scripts\get-user-idle-time.ps1" -Certificate $certSelfSigned 

exit
