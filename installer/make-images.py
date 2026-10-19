# Draws the images of the installer (run again after changing the logo):
#   welcome.bmp  side of the welcome and finish pages (164 x 314, drawn at 2x for sharp screens)
#   header.bmp   top right of the other pages (150 x 57, drawn at 2x)
#   ../assets/readme/banner.png, line.png   top and section lines of the GitHub README
# Needs Python with Pillow. Title font: Barlow Condensed Bold (fonts/, SIL Open Font License).
import random
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT.parent / 'assets'
FONT = ROOT / 'fonts' / 'BarlowCondensed-Bold.woff'
SCALE = 2   # saved size = 2x the NSIS size, the installer fits it to its window
SS = 3      # supersampling: drawn 3x bigger again, then reduced for smooth edges
K = SCALE * SS

INK = (9, 10, 13)
BLUE, VIOLET, PINK = (64, 132, 255), (139, 92, 246), (236, 72, 153)


def px(value):
    return int(value * K)


def blur_shape(size, draw_shape, radius):
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    draw_shape(ImageDraw.Draw(layer))
    return layer.filter(ImageFilter.GaussianBlur(radius))


def grain(size, strength):
    random.seed(7)
    noise = Image.effect_noise((size[0] // SS, size[1] // SS), 64).resize(size)
    return Image.merge('RGBA', [noise, noise, noise, Image.new('L', size, strength)])


def square_icon(size):
    # The DC icon on a sharp square: its own background fills the rounded corners
    icon = Image.open(ASSETS / 'icon-256.png').convert('RGBA')
    tile = Image.new('RGBA', icon.size, icon.getpixel((icon.width // 2, icon.height // 8))[:3] + (255,))
    tile.alpha_composite(icon)
    return tile.resize((size, size), Image.LANCZOS)


def welcome():
    w, h = px(164), px(314)
    image = Image.new('RGBA', (w, h), INK + (255,))

    # Aurora: three colored lights falling from the top right corner
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.polygon([(px(60), 0), (px(190), 0), (px(150), px(150)), (px(20), px(120))], fill=VIOLET + (150,)), px(26)))
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.polygon([(px(110), 0), (px(200), 0), (px(190), px(90)), (px(90), px(70))], fill=BLUE + (170,)), px(20)))
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.ellipse([px(110), px(70), px(210), px(170)], fill=PINK + (90,)), px(28)))

    # Thin vertical grid, fading towards the bottom
    lines = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(lines)
    for x in range(px(18), w, px(32)):
        draw.line([(x, 0), (x, h)], fill=(255, 255, 255, 16), width=max(1, K // 2))
    fade = Image.linear_gradient('L').resize((w, h)).point(lambda v: 255 - v)
    lines.putalpha(ImageChops.multiply(lines.getchannel('A'), fade))
    image = Image.alpha_composite(image, lines)

    # Sharp light beam across the aurora
    beam = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(beam).line([(px(90), px(130)), (px(164), px(68))], fill=(255, 255, 255, 55), width=K)
    image = Image.alpha_composite(image, beam)

    # DC square, sharp, with a fine light outline and a colored glow under it
    x0, y0, size = px(18), px(36), px(54)
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.rectangle([x0, y0 + px(8), x0 + size, y0 + size + px(8)], fill=VIOLET + (120,)), px(10)))
    image.alpha_composite(square_icon(size), (x0, y0))
    outline = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(outline).rectangle([x0 - K, y0 - K, x0 + size + K, y0 + size + K], outline=(255, 255, 255, 70), width=K)
    image = Image.alpha_composite(image, outline)

    # Title: two lines, uppercase, left aligned
    # Biggest size where SCAFFOLD fits the width
    size = px(60)
    while ImageFont.truetype(str(FONT), size).getlength('SCAFFOLD') > w - px(34):
        size -= K
    font = ImageFont.truetype(str(FONT), size)
    draw = ImageDraw.Draw(image)
    draw.text((px(16), px(206)), 'DC', font=font, fill=(255, 255, 255), anchor='ls')
    draw.text((px(16), px(206) + int(size * 0.86)), 'SCAFFOLD', font=font, fill=(255, 255, 255), anchor='ls')
    title_bottom = px(206) + int(size * 0.86)

    # Accent bar under the title: sharp, blue to pink
    bar = Image.linear_gradient('L').rotate(90).resize((px(40), px(3)))
    colored = Image.merge('RGB', [band.point(lambda v, a=a, b=b: int(a + (b - a) * v / 255)) for band, a, b in zip([bar] * 3, BLUE, PINK)])
    image.paste(colored, (px(18), title_bottom + px(10)))

    # Djason CHERY at the bottom left
    logo = Image.open(ASSETS / 'logo-light.png').convert('RGBA')
    logo = logo.resize((px(70), int(px(70) * logo.height / logo.width)), Image.LANCZOS)
    image.alpha_composite(logo, (px(18), px(282)))

    image = Image.alpha_composite(image, grain((w, h), 10))
    image.convert('RGB').resize((164 * SCALE, 314 * SCALE), Image.LANCZOS).save(ROOT / 'welcome.bmp')


def header():
    w, h = px(150), px(57)
    image = Image.new('RGBA', (w, h), (255, 255, 255, 255))
    size = px(36)
    x, y = w - size - px(12), (h - size) // 2
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.rectangle([x, y + px(3), x + size, y + size + px(3)], fill=(0, 0, 0, 50)), px(3)))
    image.alpha_composite(square_icon(size), (x, y))
    image.convert('RGB').resize((150 * SCALE, 57 * SCALE), Image.LANCZOS).save(ROOT / 'header.bmp')


def font(name, size):
    return ImageFont.truetype(str(ROOT / 'fonts' / f'BarlowCondensed-{name}.woff'), size)


def readme_banner():
    # Top of the GitHub README (assets/readme/banner.png): the same look as the window and the welcome image.
    # 1280 x 400, drawn at 2x for sharp screens, supersampled 2x again for smooth edges.
    S = 4
    w, h = 1280 * S, 400 * S
    image = Image.new('RGBA', (w, h), INK + (255,))

    # Aurora on the right
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.polygon([(w * 0.48, 0), (w * 1.05, 0), (w * 0.95, h * 0.75), (w * 0.42, h * 0.55)], fill=VIOLET + (150,)), 70 * S))
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.polygon([(w * 0.70, 0), (w * 1.05, 0), (w * 1.05, h * 0.45), (w * 0.62, h * 0.30)], fill=BLUE + (170,)), 55 * S))
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.ellipse([w * 0.70, h * 0.45, w * 1.05, h * 1.15], fill=PINK + (95,)), 80 * S))

    # Fine vertical grid fading towards the bottom
    lines = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(lines)
    for x in range(40 * S, w, 80 * S):
        draw.line([(x, 0), (x, h)], fill=(255, 255, 255, 15), width=S)
    fade = Image.linear_gradient('L').resize((w, h)).point(lambda v: 255 - v)
    lines.putalpha(ImageChops.multiply(lines.getchannel('A'), fade))
    image = Image.alpha_composite(image, lines)

    # Thin light beam across the aurora
    beam = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(beam).line([(w * 0.70, h), (w * 0.93, 0)], fill=(255, 255, 255, 60), width=S)
    image = Image.alpha_composite(image, beam)

    # DC square with its outline and glow
    x0, y0, size = 72 * S, 64 * S, 84 * S
    image = Image.alpha_composite(image, blur_shape((w, h), lambda d: d.rectangle([x0, y0 + 14 * S, x0 + size, y0 + size + 14 * S], fill=VIOLET + (130,)), 18 * S))
    image.alpha_composite(square_icon(size), (x0, y0))
    outline = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(outline).rectangle([x0 - S, y0 - S, x0 + size + S, y0 + size + S], outline=(255, 255, 255, 80), width=S)
    image = Image.alpha_composite(image, outline)

    draw = ImageDraw.Draw(image)
    # Title on one line, very large
    draw.text((68 * S, 292 * S), 'DC SCAFFOLD', font=font('ExtraBold', 150 * S), fill=(255, 255, 255), anchor='ls')

    # Gradient bar under the title
    bar = Image.linear_gradient('L').rotate(90).resize((96 * S, 5 * S))
    colored = Image.merge('RGB', [band.point(lambda v, a=a, b=b: int(a + (b - a) * v / 255)) for band, a, b in zip([bar] * 3, BLUE, PINK)])
    image.paste(colored, (74 * S, 314 * S))

    # Tagline and stacks
    draw.text((74 * S, 356 * S), 'CRÉATEUR DE PROJETS WEB  ·  WEB PROJECT CREATOR', font=font('SemiBold', 22 * S), fill=(255, 255, 255, 150), anchor='ls')

    # Djason CHERY at the bottom right
    logo = Image.open(ASSETS / 'logo-light.png').convert('RGBA')
    logo = logo.resize((150 * S, int(150 * S * logo.height / logo.width)), Image.LANCZOS)
    image.alpha_composite(logo, (w - 72 * S - logo.width, h - 40 * S - logo.height))

    image = Image.alpha_composite(image, grain((w, h), 9))
    out = ROOT.parent / 'assets' / 'readme'
    out.mkdir(exist_ok=True)
    image.convert('RGB').resize((2560, 800), Image.LANCZOS).save(out / 'banner.png', optimize=True)

    # Gradient line between the sections of the README
    line = Image.linear_gradient('L').rotate(90).resize((2560, 6))
    Image.merge('RGB', [line.point(lambda v, a=a, b=b: int(a + (b - a) * v / 255)) for a, b in zip(BLUE, PINK)]).save(out / 'line.png', optimize=True)


welcome()
header()
readme_banner()
print('welcome.bmp, header.bmp, ../assets/readme/banner.png, ../assets/readme/line.png')
