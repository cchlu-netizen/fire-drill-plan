Add-Type -AssemblyName "System.IO.Compression"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"

$source = "C:\opencode0528\消防演練\防火演練計畫.docx"
$dest = "C:\opencode0528\消防演練\防火演練計畫_已填寫.docx"
Copy-Item $source $dest -Force

$zip = [System.IO.Compression.ZipFile]::Open($dest, [System.IO.Compression.ZipArchiveMode]::Update)
$entry = $zip.GetEntry("word/document.xml")
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()

$xml = $xml.Replace("____層 / 地下____層", "4層 / 地下1層")
$xml = $xml.Replace("_________________ 平方公尺", "約8000 平方公尺")
$xml = $xml.Replace("____ 人", "55 人")
$xml = $xml.Replace("____年____月____日", "114年6月10日")
$xml = $xml.Replace("____ : ____ ～ ____ : ____", "14:00 ～ 18:00")
$xml = $xml.Replace("____ 分隊", "平鎮分隊")

$count = 0
while ($xml.Contains("_________________________")) {
    $count++
    $replacement = ""
    if ($count -eq 1) { $replacement = "桃園市平鎮區南東路57-1號" }
    elseif ($count -eq 2) { $replacement = "呂忠誠（控管課長）" }
    elseif ($count -eq 3) { $replacement = "F115初00632" }
    elseif ($count -eq 4) { $replacement = "呂忠誠" }
    elseif ($count -eq 5) { $replacement = "徐文偉（店總）" }
    else { break }
    $idx = $xml.IndexOf("_________________________")
    $xml = $xml.Substring(0, $idx) + $replacement + $xml.Substring($idx + 25)
}

Write-Host "Replaced $count fields"

$entry = $zip.GetEntry("word/document.xml")
$entry.Delete()
$entry2 = $zip.CreateEntry("word/document.xml")
$writer = New-Object System.IO.StreamWriter($entry2.Open())
$writer.Write($xml)
$writer.Close()
$zip.Dispose()
Write-Host "Done!"
