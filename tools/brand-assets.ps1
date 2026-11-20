# Build YazFit brand assets from the designed banner:
#  1) assets/yazfit-hero.jpg  = full banner (welcome-screen hero, with its design text)
#  2) assets/hero-bg.jpg      = athlete-center crop (app background, NO baked-in text/nav)
Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\Mehrdad Faramehr\Desktop\photo_2026-11-21_01-34-10.jpg"
$base    = "C:\Users\Mehrdad Faramehr\.zcode\workspace\b16be84a-73a9-4c75-bc1c-0090cdd84b54\fitpulse\assets"
New-Item -ItemType Directory -Force -Path $base | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Jpeg($bmp, $path) {
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
  $bmp.Save($path, $jpegCodec, $ep)
  $bmp.Dispose()
  $kb = [int]((Get-Item $path).Length / 1KB)
  Write-Output ("saved: {0}  {1} KB" -f $path, $kb)
}

$src = [System.Drawing.Image]::FromFile($srcPath)
$w = $src.Width; $h = $src.Height
Write-Output ("source: {0}x{1}" -f $w, $h)

# --- 1) full banner hero (cap width 1600) ---
$hw = [Math]::Min(1600, $w); $hh = [int]($h * $hw / $w)
$bmp = New-Object System.Drawing.Bitmap($hw, $hh)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.DrawImage($src, (New-Object System.Drawing.Rectangle(0,0,$hw,$hh)), (New-Object System.Drawing.Rectangle(0,0,$w,$h)), [System.Drawing.GraphicsUnit]::Pixel)
$gfx.Dispose()
Save-Jpeg $bmp "$base\yazfit-hero.jpg"

# --- 2) athlete-center crop for app background ---
# excludes: left brand text (<31.5%), top nav (<8%), right CTA & side text (>82.5%)
$x = [int]($w * 0.315); $y = [int]($h * 0.080)
$cw = [int]($w * 0.510); $ch = [int]($h * 0.920)
$bmp = New-Object System.Drawing.Bitmap($cw, $ch)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gfx.DrawImage($src, (New-Object System.Drawing.Rectangle(0,0,$cw,$ch)), (New-Object System.Drawing.Rectangle($x,$y,$cw,$ch)), [System.Drawing.GraphicsUnit]::Pixel)
$gfx.Dispose()
Save-Jpeg $bmp "$base\hero-bg.jpg"

$src.Dispose()
