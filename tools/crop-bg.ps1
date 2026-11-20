# Crop phone-screenshot photo into a clean app background (removes all story/phone UI)
Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\Mehrdad Faramehr\Desktop\photo_2026-11-21_01-24-08.jpg"
$outPath = "C:\Users\Mehrdad Faramehr\.zcode\workspace\b16be84a-73a9-4c75-bc1c-0090cdd84b54\fitpulse\assets\hero-bg.jpg"
New-Item -ItemType Directory -Force -Path (Split-Path $outPath) | Out-Null

$src = [System.Drawing.Image]::FromFile($srcPath)
$w = $src.Width; $h = $src.Height
Write-Output ("source: {0}x{1}" -f $w, $h)

# Crop fractions (proportional to screenshot layout):
#  top 15%   -> status bar, story progress bars, avatar/date/music header
#  bottom from 77.5% -> reactions, @-watermark, emoji, thumbnail strip
#  1% inset left/right -> rounded story-card corners
$x = [int]($w * 0.010)
$y = [int]($h * 0.150)
$cw = [int]($w * 0.980)
$ch = [int]($h * 0.625)

# cap size for web
if ($cw -gt 1400) { $ch = [int]($ch * 1400 / $cw); $cw = 1400 }

$bmp = New-Object System.Drawing.Bitmap($cw, $ch)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$dst = New-Object System.Drawing.Rectangle(0, 0, $cw, $ch)
$srcRect = New-Object System.Drawing.Rectangle($x, $y, [int]($w*0.980), [int]($h*0.625))
$gfx.DrawImage($src, $dst, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gfx.Dispose()
$src.Dispose()

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
$bmp.Save($outPath, $codec, $ep)
$bmp.Dispose()
$kb = [int]((Get-Item $outPath).Length / 1KB)
Write-Output ("output: {0}x{1}  {2} KB" -f $cw, $ch, $kb)
