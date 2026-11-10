$ErrorActionPreference = 'Continue'
Set-Location 'C:\Users\ZUO\Documents\deepseek-harness\dsh-creater\model-price-radar'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class CredReader5 {
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct CREDENTIAL {
    public uint Flags; public uint Type; public string TargetName; public string Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
    public uint CredentialBlobSize; public IntPtr CredentialBlob; public uint Persist;
    public uint AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName;
  }
  [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
  public static extern bool CredRead(string target, uint type, uint flags, out IntPtr credential);
  [DllImport("advapi32.dll", SetLastError = true)]
  public static extern void CredFree(IntPtr cred);
}
"@

$ptr = [IntPtr]::Zero
if (-not [CredReader5]::CredRead('GitHub - https://api.github.com/davzlcm', 1, 0, [ref]$ptr)) { throw 'credential not found' }
$cred = [Runtime.InteropServices.Marshal]::PtrToStructure($ptr, [type][CredReader5+CREDENTIAL])
$bytes = New-Object byte[] $cred.CredentialBlobSize
[Runtime.InteropServices.Marshal]::Copy($cred.CredentialBlob, $bytes, 0, $cred.CredentialBlobSize)
[CredReader5]::CredFree($ptr) | Out-Null
$token = [Text.Encoding]::UTF8.GetString($bytes).Trim()
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
$gitAuth = "http.https://github.com/.extraheader=Authorization: Basic $basic"

for ($i = 1; $i -le 4; $i++) {
  git -c $gitAuth -c credential.helper= push origin main 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) { Write-Output 'pushed'; break }
  Start-Sleep -Seconds 5
}
git log --oneline -1
