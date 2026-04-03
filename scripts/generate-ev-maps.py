"""
Generate depth maps and motion masks for the EV simulator scene photos.

Each scene gets a grayscale depth map (white=near, black=far) and a motion mask
(white=moving, black=static) tailored to the scene content.

Usage: python3 scripts/generate-ev-maps.py
"""

from PIL import Image, ImageDraw, ImageFilter
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'exposure-simulator')


def make_gradient(w, h, direction='vertical', center=None):
    """Create a gradient image. direction: vertical, horizontal, radial."""
    img = Image.new('L', (w, h))
    pixels = img.load()

    if direction == 'radial' and center:
        cx, cy = center
        max_dist = ((max(cx, w - cx)) ** 2 + (max(cy, h - cy)) ** 2) ** 0.5
        for y in range(h):
            for x in range(w):
                dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
                val = int(255 * (1 - min(dist / max_dist, 1)))
                pixels[x, y] = val
    elif direction == 'vertical':
        for y in range(h):
            val = int(255 * (y / h))
            for x in range(w):
                pixels[x, y] = val
    elif direction == 'horizontal':
        for x in range(w):
            val = int(255 * (x / w))
            for y in range(h):
                pixels[x, y] = val

    return img


def street_depth(w, h):
    """Street scene: sidewalk close at bottom, buildings far at top.
    People at mid-distance (~0.3 depth). Buildings recede into distance."""
    img = Image.new('L', (w, h))
    pixels = img.load()
    for y in range(h):
        # Bottom of image = near (white), top = far (black)
        # Non-linear: ground plane perspective
        t = y / h
        # Perspective: near ground drops off quickly
        depth = int(255 * (1 - t ** 0.6))
        for x in range(w):
            pixels[x, y] = depth

    # Add a "person" region at mid-distance (slightly closer than surroundings)
    draw = ImageDraw.Draw(img)
    person_x = int(w * 0.45)
    person_w = int(w * 0.1)
    person_top = int(h * 0.25)
    person_bottom = int(h * 0.85)
    draw.rectangle([person_x, person_top, person_x + person_w, person_bottom],
                    fill=200)  # near-ish

    return img.filter(ImageFilter.GaussianBlur(radius=15))


def street_motion(w, h):
    """Street scene: walking person moves, background static."""
    img = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(img)

    # Walking person region — vertical stripe with soft edges
    person_x = int(w * 0.4)
    person_w = int(w * 0.15)
    person_top = int(h * 0.2)
    person_bottom = int(h * 0.9)
    draw.rectangle([person_x, person_top, person_x + person_w, person_bottom],
                    fill=220)

    # Some cars at bottom
    draw.rectangle([int(w * 0.7), int(h * 0.7), int(w * 0.95), int(h * 0.85)],
                    fill=180)

    return img.filter(ImageFilter.GaussianBlur(radius=20))


def landscape_depth(w, h):
    """Landscape: foreground rocks near, mountains far.
    Bottom third is close, top two-thirds recedes."""
    img = Image.new('L', (w, h))
    pixels = img.load()
    for y in range(h):
        t = y / h
        if t > 0.7:
            # Foreground (bottom 30%): near (white)
            depth = int(255 * (0.7 + (t - 0.7) / 0.3 * 0.3))
        elif t > 0.4:
            # Midground: gradual
            depth = int(255 * (0.3 + (t - 0.4) / 0.3 * 0.4))
        else:
            # Background sky/mountains: far (dark)
            depth = int(255 * (t / 0.4 * 0.3))
        for x in range(w):
            pixels[x, y] = depth

    return img.filter(ImageFilter.GaussianBlur(radius=10))


def landscape_motion(w, h):
    """Landscape: flowing water/stream at bottom, clouds at top."""
    img = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(img)

    # Flowing water at bottom
    draw.rectangle([0, int(h * 0.75), w, h], fill=200)

    # Clouds at top (subtle motion)
    draw.rectangle([0, 0, w, int(h * 0.15)], fill=100)

    return img.filter(ImageFilter.GaussianBlur(radius=25))


def portrait_depth(w, h):
    """Portrait: subject centered and near, background far.
    Strong radial falloff for creamy bokeh."""
    # Subject in center-left, face region
    img = make_gradient(w, h, 'radial', center=(int(w * 0.45), int(h * 0.35)))

    # Boost contrast: subject very near, background very far
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            v = pixels[x, y]
            # Increase contrast: near stays near, far gets darker
            v = min(255, int(v * 1.5)) if v > 128 else int(v * 0.4)
            pixels[x, y] = v

    return img.filter(ImageFilter.GaussianBlur(radius=8))


def portrait_motion(w, h):
    """Portrait: subtle hair/fabric motion on the subject."""
    img = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(img)

    # Hair region at top of subject
    draw.ellipse([int(w * 0.35), int(h * 0.1), int(w * 0.55), int(h * 0.35)],
                  fill=120)

    # Slight clothing motion
    draw.ellipse([int(w * 0.3), int(h * 0.5), int(w * 0.6), int(h * 0.8)],
                  fill=80)

    return img.filter(ImageFilter.GaussianBlur(radius=20))


def lowlight_depth(w, h):
    """Low light / night city: buildings at various distances.
    Street level near, skyline far."""
    img = Image.new('L', (w, h))
    pixels = img.load()
    for y in range(h):
        t = y / h
        # City perspective: ground near, buildings/sky far
        if t > 0.6:
            depth = int(255 * (0.6 + (t - 0.6) / 0.4 * 0.4))
        else:
            depth = int(255 * (t / 0.6 * 0.6))
        for x in range(w):
            pixels[x, y] = depth

    return img.filter(ImageFilter.GaussianBlur(radius=12))


def lowlight_motion(w, h):
    """Low light: car headlight trails on the road."""
    img = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(img)

    # Car trail region — horizontal band at road level
    draw.rectangle([0, int(h * 0.55), w, int(h * 0.75)], fill=200)

    # Some pedestrian motion
    draw.rectangle([int(w * 0.2), int(h * 0.3), int(w * 0.3), int(h * 0.7)],
                    fill=100)

    return img.filter(ImageFilter.GaussianBlur(radius=20))


# Get dimensions from actual photos
scenes = {
    'street': (street_depth, street_motion),
    'landscape': (landscape_depth, landscape_motion),
    'portrait': (portrait_depth, portrait_motion),
    'lowlight': (lowlight_depth, lowlight_motion),
}

for name, (depth_fn, motion_fn) in scenes.items():
    photo_path = os.path.join(OUT, f'{name}.jpg')
    photo = Image.open(photo_path)
    w, h = photo.size
    print(f'{name}: {w}x{h}')

    depth = depth_fn(w, h)
    depth.save(os.path.join(OUT, f'{name}-depth.png'))

    motion = motion_fn(w, h)
    motion.save(os.path.join(OUT, f'{name}-motion.png'))

print(f'Generated depth maps and motion masks for {len(scenes)} scenes')
