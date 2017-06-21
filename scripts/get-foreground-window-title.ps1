<#
    .Synopsis
        Gets active window in a user session

    .Description
        Gets active window in a user session. It displays the process name and window title of the process

    .Example
        .\Get-ActiveWindow.ps1

        Description
        -----------
        Gets the active window that is currently highlighted.

    .Notes
        AUTHOR:    Sitaram Pamarthi
        Website:   http://techibee.com
#>
[CmdletBinding()]
Param(
)
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class UserWindows {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
}
"@
try {
$OutputEncoding = New-Object -typename System.Text.UTF8Encoding
[Console]::OutputEncoding = New-Object -typename System.Text.UTF8Encoding
$ActiveHandle = [UserWindows]::GetForegroundWindow()
$Process = Get-Process | ? {$_.MainWindowHandle -eq $activeHandle}
($Process | Select ProcessName, @{Name="AppTitle";Expression= {($_.MainWindowTitle)}} ) | foreach {$_.ProcessName + ',' +$_.AppTitle}
} catch {
    Write-Error "Failed to get active Window details. More Info: $_"
}
# SIG # Begin signature block
# MIIFuQYJKoZIhvcNAQcCoIIFqjCCBaYCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUWXpP1wt6RYVOhtx5IeaVDdh3
# 4iCgggNCMIIDPjCCAiqgAwIBAgIQePcS7QuxzKhA4Ypk0fcLQjAJBgUrDgMCHQUA
# MCwxKjAoBgNVBAMTIVBvd2VyU2hlbGwgTG9jYWwgQ2VydGlmaWNhdGUgUm9vdDAe
# Fw0xNzAyMTcwOTAzNTJaFw0zOTEyMzEyMzU5NTlaMBoxGDAWBgNVBAMTD1Bvd2Vy
# U2hlbGwgVXNlcjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALSRfAPw
# UAbpKHZ3yCUjWdvLFb3dib9mkulqDTQR1o9Udm5pter/pZBV9rVog/RpivUjtVt5
# PlSYZov1iaN++cMV3ZsERKtGtSxWdQJf0aLw3k7yhHRNMKVEaWp2XKX8sSwo9NU2
# bJvTRsaYRFLC14laWMHI1obqcmrpt5bvsWP7kly3qWWGoWZFS5JeV+Bkt4dEWkX6
# OpYDRwlZJ8QsIJz/l5QNxiyPYbAjKY2Uyq7yVOt/Jpmem/BSTDtxep2pmSEVOT15
# YvktQFFzalNQcODH2ylzq6hyWYkal9uMOfCSaQgnAfdFg5eKaqZRB01pTDO9ZabB
# m7qrvaHX512KpNMCAwEAAaN2MHQwEwYDVR0lBAwwCgYIKwYBBQUHAwMwXQYDVR0B
# BFYwVIAQZx4/JZEO0VvmAiLQqLAsjqEuMCwxKjAoBgNVBAMTIVBvd2VyU2hlbGwg
# TG9jYWwgQ2VydGlmaWNhdGUgUm9vdIIQV0lgmsRF8aNIxzzICpBPrzAJBgUrDgMC
# HQUAA4IBAQB1CvtIyAXmChUn8JvtfcIzAmnQn44CcvGqZoi4wUrumqUFZObiGjjs
# Q3YHkhVvBHYwQ7+hG4W5rsXu4CEHsKKQLkOtQhOBL63Ws4WTllLOIUNSfgR6vsH+
# XvBGIubRCcYLrJWvpNQ/uEGT2hfX1rqp3j8pTO2HzTEwZsln5PbFJEUygWRt1IlW
# zuQt3IaB+xJq7mYVyPMrJEtsFZfMEdc9Hrbm5aQXhE9IGiJ5DaU5fvyes3bDYAMP
# BxWl/jOe6yY1zcdQyzxFnFLruZJsJ/LFJUAfLL3xQ9XtGAjLQrCeBZ/IqGf6fa6y
# p27RRzSak2PY41DA523iLtqNnq0iQfUFMYIB4TCCAd0CAQEwQDAsMSowKAYDVQQD
# EyFQb3dlclNoZWxsIExvY2FsIENlcnRpZmljYXRlIFJvb3QCEHj3Eu0LscyoQOGK
# ZNH3C0IwCQYFKw4DAhoFAKB4MBgGCisGAQQBgjcCAQwxCjAIoAKAAKECgAAwGQYJ
# KoZIhvcNAQkDMQwGCisGAQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQB
# gjcCARUwIwYJKoZIhvcNAQkEMRYEFIB9Jg412FRsniQPBnvrQrH4zry4MA0GCSqG
# SIb3DQEBAQUABIIBABMZ9f3k8NRtaodU5S4MyUOXdLK6HpIy8/esvyXHsx0NyYBd
# XZ/5/pOWRE4X6Fifsw6F6cJSGgkVh2bFOp9dPbnAmtTjTLa1Pd9Lg8oUl2SGEXtn
# mpoWLOnHQkrHOVP9/OhW59iJqvYD4J15PXEW2s/VLO427ksMWkQykESTKbkGE/s0
# 6AX9RTy79LdWeR8NBg9WLp3S9uFgUicrIO/50LD1IWKguw/jw4/Vv9FS2y3AK9Pb
# kKJVc8Ya5mHLpaUoI0Hbkl8lUULg1ht60XA+oc7uS1FcN7YRPBiyAukPeFf8O8a7
# Pjal3QJ+QAeipt3g075O7TKi//DiOWLR+27qS0U=
# SIG # End signature block
