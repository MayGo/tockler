Add-Type @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace PInvoke.Win32 {

    public static class UserInput {

        [DllImport("user32.dll", SetLastError=false)]
        private static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

        [StructLayout(LayoutKind.Sequential)]
        private struct LASTINPUTINFO {
            public uint cbSize;
            public int dwTime;
        }

        public static DateTime LastInput {
            get {
                DateTime bootTime = DateTime.UtcNow.AddMilliseconds(-Environment.TickCount);
                DateTime lastInput = bootTime.AddMilliseconds(LastInputTicks);
                return lastInput;
            }
        }

        public static TimeSpan IdleTime {
            get {
                return DateTime.UtcNow.Subtract(LastInput);
            }
        }

        public static int LastInputTicks {
            get {
                LASTINPUTINFO lii = new LASTINPUTINFO();
                lii.cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO));
                GetLastInputInfo(ref lii);
                return lii.dwTime;
            }
        }
    }
}
'@

[math]::floor([PInvoke.Win32.UserInput]::IdleTime.TotalSeconds)
# SIG # Begin signature block
# MIIFuQYJKoZIhvcNAQcCoIIFqjCCBaYCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUk5VYDhiyTIzm2uczGLAc+FaW
# oZqgggNCMIIDPjCCAiqgAwIBAgIQePcS7QuxzKhA4Ypk0fcLQjAJBgUrDgMCHQUA
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
# gjcCARUwIwYJKoZIhvcNAQkEMRYEFO8bIVEECKL4tNvz+InzXYF7m/TMMA0GCSqG
# SIb3DQEBAQUABIIBAIwCj1vEx4DD+4K+gPR/qFTuEoKk6Dza1gW0O+JqBF34XDQ1
# UwE0KxemfLZX/e2aMsQBDkbz6P1ADqqfVTKoCRPfeu7p6zkHgDmVEv5/NieqAQnJ
# g3XmX/mL5KA7UM89gNqrGZP4BkhEPPnCxzT3g3jrq3FvBYF1s7mxo0q1vqamTu7A
# k8BXMWlj0cMixvToc9B2T3TY0uILSm/gaTkYhoD4UT7NnExcazJs0iVzIWLCl2B2
# ZQBWO+2tInFWqsYuV4sqete69cp0p5HJUkWFD8A8w3ilqk3Ko4vmy9Eu9CTKw9KC
# mW+JZM/tQHl4LzYKYL3lpkjpxpNwojbexs3707Y=
# SIG # End signature block
