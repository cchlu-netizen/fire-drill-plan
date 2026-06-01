$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = "C:\opencode0528\消防演練\防火演練計畫.docx"
$doc = $word.Documents.Open($docPath)

$replacements = @{
    "_________________________" = "桃園市平鎮區南東路57-1號"
    "____層 / 地下____層" = "4層 / 地下1層"
    "_________________ 平方公尺" = "約8000 平方公尺"
    "____ 人" = "55 人"
    "_________________________" = "呂忠誠（控管課長）"
    "_________________________" = "F115初00632"
    "____年____月____日" = "114年6月10日"
    "____ : ____ ～ ____ : ____" = "14:00 ～ 18:00"
    "____ 分隊" = "平鎮分隊"
    "_________________________" = "呂忠誠"
    "_________________________" = "徐文偉（店總）"
}

$content = $doc.Content
$findText = $null
$replaceText = $null

foreach ($pair in $replacements.GetEnumerator()) {
    $findText = $pair.Key
    $replaceText = $pair.Value
    
    $find = $content.Find
    $find.ClearFormatting()
    $find.Text = $findText
    $find.Replacement.ClearFormatting()
    $find.Replacement.Text = $replaceText
    
    $execute = $find.Execute([ref]$true, [ref]$false, [ref]$false, [ref]$false, [ref]$false, [ref]$false, [ref]$true, [ref]$wdFindContinue, [ref]$false, [ref]$false, [ref]$false, [ref]$false)
}

$doc.SaveAs2("C:\opencode0528\消防演練\防火演練計畫_已填寫.docx")
$doc.Close()
$word.Quit()

Write-Host "Word document updated and saved."
