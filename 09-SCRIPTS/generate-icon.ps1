<#
.SYNOPSIS
    Generate the IAM Career Lab app icon as a 256x256 PNG
#>
Add-Type -AssemblyName System.Drawing

$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gfx.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$gfx.Clear([System.Drawing.Color]::Transparent)

$x = 8
$y = 8
$w = 240
$h = 240
$r = 40
$rect = New-Object System.Drawing.Rectangle $x, $y, $w, $h

$bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$bgPath.AddArc($rect.X, $rect.Y, $r, $r, 180, 90)
$bgPath.AddArc($rect.Right - $r, $rect.Y, $r, $r, 270, 90)
$bgPath.AddArc($rect.Right - $r, $rect.Bottom - $r, $r, $r, 0, 90)
$bgPath.AddArc($rect.X, $rect.Bottom - $r, $r, $r, 90, 90)
$bgPath.CloseFigure()

$p1 = [System.Drawing.Color]::FromArgb(52, 120, 246)
$p2 = [System.Drawing.Color]::FromArgb(31, 89, 219)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $p1, $p2, 45
$gfx.FillPath($brush, $bgPath)

# Shield
$shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$cx = 128
$top = 50
$bottom = 210
$sw = 70
$shieldPath.AddLine($cx - $sw, $top, $cx + $sw, $top)
$shieldPath.AddLine($cx + $sw, $top, $cx + $sw, 90)
$shieldPath.AddBezier($cx + $sw, 90, $cx + $sw, 160, $cx + 30, 190, $cx, $bottom)
$shieldPath.AddBezier($cx, $bottom, $cx - 30, 190, $cx - $sw, 160, $cx - $sw, 90)
$shieldPath.CloseFigure()
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 255, 255, 255))
$gfx.FillPath($whiteBrush, $shieldPath)

# "IL" text
$font = New-Object System.Drawing.Font "Segoe UI", 56, ([System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(52, 120, 246))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$textRect = New-Object System.Drawing.RectangleF 0, 70, 256, 120
$gfx.DrawString("IL", $font, $textBrush, $textRect, $sf)

$outPath = "C:\Users\erick\Downloads\IAM-CAREER-LAB\app\public\icon.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose()
$bmp.Dispose()
Write-Output "Saved $outPath"
