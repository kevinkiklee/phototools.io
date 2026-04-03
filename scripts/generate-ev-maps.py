"""
Generate illustrated scenes with matching depth maps and motion masks
for the Exposure Triangle Simulator.

Each scene is drawn programmatically with many visual details.
Depth maps and motion masks are built simultaneously so they perfectly
correspond to the illustration content.

Style: Flat geometric / low-poly illustration with rich color palettes.

Usage: python3 scripts/generate-ev-maps.py
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import random
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'exposure-simulator')
os.makedirs(OUT, exist_ok=True)

W, H = 1200, 800
random.seed(42)  # deterministic output


def lerp_color(c1, c2, t):
    """Linearly interpolate between two RGB tuples."""
    t = max(0, min(1, t))
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


def draw_gradient_rect(draw, box, c_top, c_bottom):
    """Fill a rectangle with a vertical gradient."""
    x0, y0, x1, y1 = box
    for y in range(int(y0), int(y1)):
        t = (y - y0) / max(1, y1 - y0)
        draw.line([(x0, y), (x1, y)], fill=lerp_color(c_top, c_bottom, t))


def draw_ellipse_soft(draw, bbox, fill):
    """Draw an anti-aliased-looking ellipse."""
    draw.ellipse(bbox, fill=fill)


# ═══════════════════════════════════════════════════════════════════════════════
# STREET SCENE — Busy city intersection with buildings, people, cars, details
# ═══════════════════════════════════════════════════════════════════════════════

def make_street():
    img = Image.new('RGB', (W, H))
    depth = Image.new('L', (W, H), 0)
    motion = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    dd = ImageDraw.Draw(depth)
    dm = ImageDraw.Draw(motion)

    # ── Sky gradient ──
    for y in range(H):
        t = y / H
        if t < 0.35:
            sky_t = t / 0.35
            c = lerp_color((255, 165, 90), (180, 120, 170), sky_t)
            d.line([(0, y), (W, y)], fill=c)

    # Clouds
    clouds = [(150, 40, 120, 35), (400, 60, 100, 25), (750, 30, 140, 30),
              (950, 55, 90, 22), (300, 80, 80, 20), (600, 45, 110, 28)]
    for cx, cy, rx, ry in clouds:
        for i in range(3):
            ox = random.randint(-20, 20)
            oy = random.randint(-8, 8)
            c = lerp_color((255, 200, 180), (255, 230, 210), random.random())
            d.ellipse([cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy], fill=c)
            dd.ellipse([cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy], fill=5)

    # ── Background buildings (far) ──
    bg_colors = [(60, 65, 85), (70, 60, 80), (55, 70, 90), (80, 65, 75),
                 (65, 75, 95), (50, 55, 75)]
    bx = -20
    while bx < W + 50:
        bw = random.randint(60, 120)
        bh = random.randint(120, 220)
        by = int(H * 0.35) - bh + random.randint(0, 30)
        bc = bg_colors[random.randint(0, len(bg_colors) - 1)]
        d.rectangle([bx, by, bx + bw, int(H * 0.35)], fill=bc)
        dd.rectangle([bx, by, bx + bw, int(H * 0.35)], fill=25)
        # Windows
        for wy in range(by + 8, int(H * 0.35) - 8, 14):
            for wx in range(bx + 6, bx + bw - 6, 12):
                if random.random() < 0.7:
                    wc = lerp_color((200, 180, 120), (255, 220, 140), random.random())
                    d.rectangle([wx, wy, wx + 6, wy + 8], fill=wc)
        bx += bw + random.randint(-5, 8)

    # ── Mid buildings (medium distance) ──
    mid_colors = [(45, 50, 70), (55, 45, 65), (40, 55, 75), (65, 50, 60)]
    bx = -30
    while bx < W + 50:
        bw = random.randint(80, 160)
        bh = random.randint(200, 350)
        by = int(H * 0.42) - bh + random.randint(-10, 20)
        bc = mid_colors[random.randint(0, len(mid_colors) - 1)]
        d.rectangle([bx, by, bx + bw, int(H * 0.42)], fill=bc)
        dd.rectangle([bx, by, bx + bw, int(H * 0.42)], fill=70)
        # Larger windows
        for wy in range(by + 10, int(H * 0.42) - 10, 18):
            for wx in range(bx + 8, bx + bw - 8, 16):
                if random.random() < 0.6:
                    bright = random.random()
                    wc = lerp_color((180, 160, 100), (255, 240, 180), bright)
                    d.rectangle([wx, wy, wx + 8, wy + 12], fill=wc)
        bx += bw + random.randint(-8, 12)

    # ── Road ──
    road_top = int(H * 0.42)
    draw_gradient_rect(d, (0, road_top, W, H), (80, 85, 95), (50, 55, 65))
    # Depth: perspective gradient on road
    for y in range(road_top, H):
        t = (y - road_top) / (H - road_top)
        depth_val = int(70 + t * 185)  # 70 at horizon → 255 at bottom
        dd.line([(0, y), (W, y)], fill=depth_val)

    # Road markings — crosswalk stripes
    for sx in range(int(W * 0.25), int(W * 0.75), 40):
        d.rectangle([sx, int(H * 0.72), sx + 20, int(H * 0.90)],
                     fill=(220, 220, 210))

    # Center line
    for sx in range(0, W, 60):
        d.rectangle([sx, int(H * 0.55), sx + 30, int(H * 0.555)],
                     fill=(220, 200, 80))

    # ── Sidewalk left ──
    d.polygon([(0, road_top), (0, int(H * 0.58)), (int(W * 0.18), int(H * 0.50)),
               (int(W * 0.18), road_top)], fill=(140, 135, 125))

    # ── Sidewalk right ──
    d.polygon([(W, road_top), (W, int(H * 0.58)), (int(W * 0.82), int(H * 0.50)),
               (int(W * 0.82), road_top)], fill=(140, 135, 125))

    # ── Street lamps ──
    lamp_positions = [(int(W * 0.15), int(H * 0.20), 140),
                      (int(W * 0.85), int(H * 0.22), 135)]
    for lx, ly_top, ldepth in lamp_positions:
        # Pole
        d.rectangle([lx - 2, ly_top, lx + 2, int(H * 0.52)], fill=(60, 60, 60))
        dd.rectangle([lx - 2, ly_top, lx + 2, int(H * 0.52)], fill=ldepth)
        # Lamp head
        d.ellipse([lx - 12, ly_top - 6, lx + 12, ly_top + 6], fill=(255, 230, 150))
        # Glow
        for r in range(30, 5, -5):
            alpha = int(40 * (1 - r / 30))
            gc = (255, 220, 130)
            d.ellipse([lx - r, ly_top - r // 2, lx + r, ly_top + r // 2],
                       fill=lerp_color((60, 65, 85), gc, alpha / 60))

    # ── Cars ──
    cars = [
        (int(W * 0.55), int(H * 0.58), 70, 28, (180, 50, 50), 170, 160),
        (int(W * 0.30), int(H * 0.62), 75, 30, (50, 80, 160), 190, 180),
        (int(W * 0.72), int(H * 0.68), 80, 32, (200, 180, 60), 210, 200),
    ]
    for cx, cy, cw, ch, cc, cdepth, cmotion in cars:
        # Car body
        d.rounded_rectangle([cx - cw, cy - ch, cx + cw, cy + ch],
                             radius=8, fill=cc)
        dd.rectangle([cx - cw, cy - ch, cx + cw, cy + ch], fill=cdepth)
        dm.rectangle([cx - cw, cy - ch, cx + cw, cy + ch], fill=cmotion)
        # Windshield
        d.rectangle([cx - cw + 10, cy - ch + 4, cx + cw - 10, cy - 5],
                     fill=lerp_color(cc, (150, 180, 220), 0.6))
        # Headlights
        d.ellipse([cx - cw - 2, cy - 5, cx - cw + 8, cy + 5], fill=(255, 240, 180))
        d.ellipse([cx + cw - 8, cy - 5, cx + cw + 2, cy + 5], fill=(255, 100, 80))
        # Wheels
        d.ellipse([cx - cw + 8, cy + ch - 8, cx - cw + 22, cy + ch + 6],
                   fill=(30, 30, 30))
        d.ellipse([cx + cw - 22, cy + ch - 8, cx + cw - 8, cy + ch + 6],
                   fill=(30, 30, 30))

    # ── People (various sizes for perspective) ──
    people = [
        # (x, foot_y, height, width, color, depth, motion_intensity)
        (int(W * 0.10), int(H * 0.52), 55, 14, (35, 35, 55), 150, 100),
        (int(W * 0.08), int(H * 0.50), 50, 13, (60, 40, 45), 140, 90),
        (int(W * 0.38), int(H * 0.78), 90, 22, (40, 50, 70), 220, 200),
        (int(W * 0.44), int(H * 0.80), 95, 24, (70, 45, 50), 230, 210),
        (int(W * 0.50), int(H * 0.76), 85, 20, (50, 60, 80), 215, 190),
        (int(W * 0.58), int(H * 0.82), 100, 25, (80, 50, 60), 235, 220),
        (int(W * 0.65), int(H * 0.79), 88, 21, (45, 55, 75), 225, 200),
        (int(W * 0.90), int(H * 0.54), 60, 15, (55, 50, 65), 160, 120),
        (int(W * 0.93), int(H * 0.53), 58, 14, (65, 45, 55), 155, 110),
        (int(W * 0.22), int(H * 0.74), 75, 18, (50, 45, 65), 200, 170),
        (int(W * 0.78), int(H * 0.75), 78, 19, (55, 50, 70), 205, 175),
    ]
    for px, py, ph, pw, pc, pdepth, pmotion in people:
        # Body
        d.rounded_rectangle([px - pw // 2, py - ph, px + pw // 2, py],
                             radius=pw // 3, fill=pc)
        dd.rounded_rectangle([px - pw // 2, py - ph, px + pw // 2, py],
                              radius=pw // 3, fill=pdepth)
        dm.rounded_rectangle([px - pw // 2, py - ph, px + pw // 2, py],
                              radius=pw // 3, fill=pmotion)
        # Head
        head_r = pw // 2 + 2
        d.ellipse([px - head_r, py - ph - head_r * 2, px + head_r, py - ph],
                   fill=lerp_color(pc, (200, 170, 150), 0.4))
        dd.ellipse([px - head_r, py - ph - head_r * 2, px + head_r, py - ph],
                    fill=pdepth)
        dm.ellipse([px - head_r, py - ph - head_r * 2, px + head_r, py - ph],
                    fill=pmotion)

    # ── Trees on sidewalk ──
    trees = [(int(W * 0.12), int(H * 0.32), 145), (int(W * 0.88), int(H * 0.34), 140)]
    for tx, ty, tdepth in trees:
        # Trunk
        d.rectangle([tx - 3, ty, tx + 3, ty + 60], fill=(80, 60, 40))
        dd.rectangle([tx - 3, ty, tx + 3, ty + 60], fill=tdepth)
        # Canopy — overlapping circles
        for i in range(5):
            ox = random.randint(-18, 18)
            oy = random.randint(-15, 10)
            r = random.randint(18, 28)
            gc = lerp_color((40, 90, 50), (60, 120, 60), random.random())
            d.ellipse([tx - r + ox, ty - r + oy - 10, tx + r + ox, ty + r + oy - 10],
                       fill=gc)
            dd.ellipse([tx - r + ox, ty - r + oy - 10, tx + r + ox, ty + r + oy - 10],
                        fill=tdepth)

    # ── Traffic signs, small details ──
    for sx, sy, sd in [(int(W * 0.20), int(H * 0.30), 150), (int(W * 0.80), int(H * 0.32), 145)]:
        d.rectangle([sx - 1, sy, sx + 1, sy + 50], fill=(70, 70, 70))
        d.regular_polygon((sx, sy - 5, 10), 8, fill=(220, 50, 50))
        dd.rectangle([sx - 1, sy, sx + 1, sy + 50], fill=sd)

    # Blur motion mask heavily for smooth transitions
    motion = motion.filter(ImageFilter.GaussianBlur(radius=25))
    return img, depth.filter(ImageFilter.GaussianBlur(radius=8)), motion


# ═══════════════════════════════════════════════════════════════════════════════
# LANDSCAPE — Layered mountains, lake, trees, wildflowers, clouds
# ═══════════════════════════════════════════════════════════════════════════════

def make_landscape():
    img = Image.new('RGB', (W, H))
    depth = Image.new('L', (W, H), 0)
    motion = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    dd = ImageDraw.Draw(depth)
    dm = ImageDraw.Draw(motion)

    # ── Sky ──
    for y in range(int(H * 0.45)):
        t = y / (H * 0.45)
        c = lerp_color((120, 170, 230), (200, 220, 245), t)
        d.line([(0, y), (W, y)], fill=c)

    # ── Clouds ──
    cloud_data = [(200, 50, 100, 30), (500, 35, 120, 28), (800, 55, 90, 25),
                  (350, 70, 80, 22), (700, 25, 110, 32), (100, 65, 70, 20),
                  (950, 45, 95, 26)]
    for cx, cy, rx, ry in cloud_data:
        for i in range(4):
            ox = random.randint(-25, 25)
            oy = random.randint(-8, 8)
            d.ellipse([cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy],
                       fill=lerp_color((240, 245, 255), (255, 255, 255), random.random()))
            dd.ellipse([cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy], fill=8)
            dm.ellipse([cx - rx + ox, cy - ry + oy, cx + rx + ox, cy + ry + oy], fill=60)

    # ── Far mountains (silhouette, depth ~20) ──
    pts = [(0, int(H * 0.40))]
    x = 0
    while x < W:
        peak_h = random.randint(int(H * 0.18), int(H * 0.32))
        pts.append((x, peak_h))
        x += random.randint(40, 100)
    pts.append((W, int(H * 0.40)))
    pts.append((W, int(H * 0.45)))
    pts.append((0, int(H * 0.45)))
    d.polygon(pts, fill=(130, 140, 170))
    dd.polygon(pts, fill=20)

    # ── Mid mountains (depth ~50) ──
    pts = [(0, int(H * 0.42))]
    x = 0
    while x < W:
        peak_h = random.randint(int(H * 0.28), int(H * 0.38))
        pts.append((x, peak_h))
        x += random.randint(50, 120)
    pts.append((W, int(H * 0.42)))
    pts.append((W, int(H * 0.50)))
    pts.append((0, int(H * 0.50)))
    d.polygon(pts, fill=(80, 110, 90))
    dd.polygon(pts, fill=50)

    # ── Near hills (depth ~80) ──
    pts = [(0, int(H * 0.48))]
    x = 0
    while x < W:
        hill_h = random.randint(int(H * 0.40), int(H * 0.47))
        pts.append((x, hill_h))
        x += random.randint(60, 140)
    pts.append((W, int(H * 0.48)))
    pts.append((W, int(H * 0.55)))
    pts.append((0, int(H * 0.55)))
    d.polygon(pts, fill=(60, 95, 55))
    dd.polygon(pts, fill=80)

    # ── Lake/water (depth ~100, with motion) ──
    lake_top = int(H * 0.50)
    lake_bot = int(H * 0.62)
    draw_gradient_rect(d, (0, lake_top, W, lake_bot),
                       (80, 130, 160), (60, 110, 140))
    for y in range(lake_top, lake_bot):
        t = (y - lake_top) / (lake_bot - lake_top)
        dd.line([(0, y), (W, y)], fill=int(90 + t * 40))
        dm.line([(0, y), (W, y)], fill=int(120 + t * 60))
    # Water ripples
    for i in range(20):
        ry = random.randint(lake_top + 5, lake_bot - 5)
        rx = random.randint(50, W - 50)
        rw = random.randint(30, 80)
        d.line([(rx, ry), (rx + rw, ry)],
               fill=lerp_color((100, 150, 180), (120, 170, 200), random.random()),
               width=1)

    # ── Meadow/grass (depth ~130-220) ──
    meadow_top = int(H * 0.58)
    for y in range(meadow_top, H):
        t = (y - meadow_top) / (H - meadow_top)
        c = lerp_color((50, 100, 40), (70, 130, 50), t)
        d.line([(0, y), (W, y)], fill=c)
        dd.line([(0, y), (W, y)], fill=int(130 + t * 125))

    # ── Trees (mid-ground, on hills) ──
    tree_data = [(100, int(H * 0.49), 25, 90), (250, int(H * 0.50), 22, 85),
                 (400, int(H * 0.48), 28, 95), (600, int(H * 0.49), 24, 88),
                 (800, int(H * 0.50), 26, 92), (1000, int(H * 0.48), 23, 87),
                 (1100, int(H * 0.49), 20, 80)]
    for tx, ty, tr, tdepth in tree_data:
        # Trunk
        d.rectangle([tx - 3, ty, tx + 3, ty + 25], fill=(70, 50, 30))
        dd.rectangle([tx - 3, ty, tx + 3, ty + 25], fill=tdepth)
        # Canopy — multiple overlapping circles for fullness
        for i in range(6):
            ox = random.randint(-12, 12)
            oy = random.randint(-10, 5)
            r = random.randint(tr - 5, tr + 5)
            gc = lerp_color((30, 75, 35), (50, 110, 45), random.random())
            d.ellipse([tx - r + ox, ty - r * 2 + oy, tx + r + ox, ty + oy], fill=gc)
            dd.ellipse([tx - r + ox, ty - r * 2 + oy, tx + r + ox, ty + oy], fill=tdepth)

    # ── Foreground wildflowers & grass blades ──
    for i in range(200):
        fx = random.randint(0, W)
        fy = random.randint(int(H * 0.72), H)
        fdepth = int(200 + (fy - H * 0.72) / (H - H * 0.72) * 55)
        # Grass blade
        blade_h = random.randint(8, 20)
        gc = lerp_color((40, 90, 35), (80, 140, 50), random.random())
        d.line([(fx, fy), (fx + random.randint(-3, 3), fy - blade_h)],
               fill=gc, width=2)
        # Some flowers
        if random.random() < 0.3:
            fc = random.choice([
                (255, 100, 100), (255, 200, 80), (200, 100, 255),
                (255, 255, 100), (255, 150, 200), (100, 200, 255)
            ])
            fr = random.randint(3, 6)
            d.ellipse([fx - fr, fy - blade_h - fr, fx + fr, fy - blade_h + fr],
                       fill=fc)
            dd.ellipse([fx - fr, fy - blade_h - fr, fx + fr, fy - blade_h + fr],
                        fill=fdepth)

    # ── Rocks in foreground ──
    rocks = [(int(W * 0.15), int(H * 0.85), 30, 18),
             (int(W * 0.80), int(H * 0.88), 25, 15),
             (int(W * 0.50), int(H * 0.92), 35, 20)]
    for rx, ry, rw, rh in rocks:
        d.ellipse([rx - rw, ry - rh, rx + rw, ry + rh], fill=(100, 95, 85))
        d.ellipse([rx - rw + 3, ry - rh + 2, rx + rw - 5, ry + rh - 3],
                   fill=(120, 115, 105))
        dd.ellipse([rx - rw, ry - rh, rx + rw, ry + rh], fill=240)

    # ── Sun ──
    sun_x, sun_y = int(W * 0.75), int(H * 0.08)
    for r in range(40, 10, -5):
        gc = lerp_color((255, 240, 200), (255, 200, 100), r / 40)
        d.ellipse([sun_x - r, sun_y - r, sun_x + r, sun_y + r], fill=gc)

    motion = motion.filter(ImageFilter.GaussianBlur(radius=20))
    return img, depth.filter(ImageFilter.GaussianBlur(radius=6)), motion


# ═══════════════════════════════════════════════════════════════════════════════
# PORTRAIT — Stylized bust with decorative bokeh background
# ═══════════════════════════════════════════════════════════════════════════════

def make_portrait():
    img = Image.new('RGB', (W, H))
    depth = Image.new('L', (W, H), 0)
    motion = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    dd = ImageDraw.Draw(depth)
    dm = ImageDraw.Draw(motion)

    # ── Background: rich gradient with bokeh circles ──
    for y in range(H):
        t = y / H
        c = lerp_color((25, 50, 60), (40, 30, 50), t)
        d.line([(0, y), (W, y)], fill=c)
        dd.line([(0, y), (W, y)], fill=15)

    # Bokeh circles (background, far depth)
    for i in range(80):
        bx = random.randint(0, W)
        by = random.randint(0, H)
        br = random.randint(15, 55)
        alpha = random.randint(15, 50)
        bc = lerp_color((25, 50, 60), random.choice([
            (80, 160, 140), (160, 120, 80), (120, 80, 140),
            (80, 120, 180), (180, 100, 100), (100, 180, 120),
            (200, 180, 100), (100, 150, 200)
        ]), alpha / 50)
        d.ellipse([bx - br, by - br, bx + br, by + br], fill=bc)
        # Bright rim
        d.ellipse([bx - br, by - br, bx + br, by + br],
                   outline=lerp_color(bc, (255, 255, 255), 0.3), width=1)

    # ── Foliage (background, some slightly closer) ──
    for i in range(40):
        lx = random.randint(0, W)
        ly = random.randint(0, H)
        lr = random.randint(8, 25)
        lc = lerp_color((20, 60, 35), (40, 90, 50), random.random())
        d.ellipse([lx - lr, ly - lr, lx + lr, ly + lr], fill=lc)
        dd.ellipse([lx - lr, ly - lr, lx + lr, ly + lr], fill=25)

    # ── Subject: stylized person bust ──
    # Center of subject
    sx, sy = int(W * 0.48), int(H * 0.45)

    # Shoulders/torso
    torso_pts = [
        (sx - 140, int(H * 0.98)),
        (sx - 120, int(H * 0.65)),
        (sx - 80, int(H * 0.55)),
        (sx, int(H * 0.50)),
        (sx + 80, int(H * 0.55)),
        (sx + 120, int(H * 0.65)),
        (sx + 140, int(H * 0.98)),
    ]
    d.polygon(torso_pts, fill=(60, 55, 75))
    dd.polygon(torso_pts, fill=220)

    # Shirt/collar detail
    collar_pts = [
        (sx - 50, int(H * 0.52)),
        (sx, int(H * 0.58)),
        (sx + 50, int(H * 0.52)),
        (sx + 35, int(H * 0.48)),
        (sx, int(H * 0.46)),
        (sx - 35, int(H * 0.48)),
    ]
    d.polygon(collar_pts, fill=(80, 75, 95))

    # Neck
    d.rectangle([sx - 22, int(H * 0.38), sx + 22, int(H * 0.50)],
                 fill=(185, 145, 120))
    dd.rectangle([sx - 22, int(H * 0.38), sx + 22, int(H * 0.50)], fill=235)

    # Head — oval
    head_cx, head_cy = sx, int(H * 0.28)
    head_rx, head_ry = 65, 80
    d.ellipse([head_cx - head_rx, head_cy - head_ry,
               head_cx + head_rx, head_cy + head_ry],
              fill=(195, 155, 130))
    dd.ellipse([head_cx - head_rx, head_cy - head_ry,
                head_cx + head_rx, head_cy + head_ry], fill=245)

    # Hair
    hair_color = (40, 30, 25)
    d.ellipse([head_cx - head_rx - 5, head_cy - head_ry - 10,
               head_cx + head_rx + 5, head_cy - 10],
              fill=hair_color)
    dd.ellipse([head_cx - head_rx - 5, head_cy - head_ry - 10,
                head_cx + head_rx + 5, head_cy - 10], fill=250)
    # Hair sides
    d.ellipse([head_cx - head_rx - 8, head_cy - 30,
               head_cx - head_rx + 15, head_cy + 40],
              fill=hair_color)
    d.ellipse([head_cx + head_rx - 15, head_cy - 30,
               head_cx + head_rx + 8, head_cy + 40],
              fill=hair_color)
    # Hair motion (subtle)
    dm.ellipse([head_cx - head_rx - 8, head_cy - head_ry - 10,
                head_cx + head_rx + 8, head_cy - 10], fill=60)

    # Eyes
    eye_y = head_cy + 5
    for ex in [head_cx - 22, head_cx + 22]:
        # White
        d.ellipse([ex - 12, eye_y - 6, ex + 12, eye_y + 6], fill=(240, 240, 240))
        # Iris
        d.ellipse([ex - 6, eye_y - 6, ex + 6, eye_y + 6], fill=(70, 100, 60))
        # Pupil
        d.ellipse([ex - 3, eye_y - 3, ex + 3, eye_y + 3], fill=(20, 20, 20))
        # Highlight
        d.ellipse([ex + 1, eye_y - 4, ex + 4, eye_y - 1], fill=(255, 255, 255))

    # Eyebrows
    d.arc([head_cx - 38, eye_y - 20, head_cx - 8, eye_y - 5], 200, 340,
          fill=(50, 40, 35), width=3)
    d.arc([head_cx + 8, eye_y - 20, head_cx + 38, eye_y - 5], 200, 340,
          fill=(50, 40, 35), width=3)

    # Nose
    d.polygon([(head_cx, eye_y + 10), (head_cx - 8, eye_y + 28),
               (head_cx + 8, eye_y + 28)],
              fill=(180, 140, 115))

    # Mouth
    d.arc([head_cx - 18, eye_y + 32, head_cx + 18, eye_y + 50], 10, 170,
          fill=(180, 100, 90), width=3)

    # Ears
    for ear_x, ear_dir in [(head_cx - head_rx, -1), (head_cx + head_rx, 1)]:
        d.ellipse([ear_x - 8, head_cy - 5, ear_x + 8, head_cy + 20],
                   fill=(185, 145, 120))

    # ── Foreground blur elements (very near, will be heavily blurred) ──
    for i in range(12):
        fx = random.choice([random.randint(0, int(W * 0.15)),
                            random.randint(int(W * 0.85), W)])
        fy = random.randint(int(H * 0.3), H)
        fr = random.randint(20, 50)
        fc = lerp_color((20, 50, 30), (40, 80, 45), random.random())
        d.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=fc)
        dd.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=255)

    motion = motion.filter(ImageFilter.GaussianBlur(radius=30))
    return img, depth.filter(ImageFilter.GaussianBlur(radius=5)), motion


# ═══════════════════════════════════════════════════════════════════════════════
# LOW LIGHT — Night cityscape with neon, reflections, light sources
# ═══════════════════════════════════════════════════════════════════════════════

def make_lowlight():
    img = Image.new('RGB', (W, H))
    depth = Image.new('L', (W, H), 0)
    motion = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    dd = ImageDraw.Draw(depth)
    dm = ImageDraw.Draw(motion)

    # ── Night sky ──
    for y in range(int(H * 0.35)):
        t = y / (H * 0.35)
        c = lerp_color((8, 8, 25), (15, 15, 35), t)
        d.line([(0, y), (W, y)], fill=c)
        dd.line([(0, y), (W, y)], fill=5)

    # Stars
    for i in range(60):
        sx = random.randint(0, W)
        sy = random.randint(0, int(H * 0.25))
        sr = random.randint(1, 2)
        brightness = random.randint(150, 255)
        d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr],
                   fill=(brightness, brightness, brightness))

    # ── Background buildings (far skyline) ──
    bx = -20
    while bx < W + 50:
        bw = random.randint(50, 100)
        bh = random.randint(80, 200)
        by = int(H * 0.35) - bh
        bc = lerp_color((15, 15, 30), (25, 25, 45), random.random())
        d.rectangle([bx, by, bx + bw, int(H * 0.35)], fill=bc)
        dd.rectangle([bx, by, bx + bw, int(H * 0.35)], fill=20)
        # Lit windows
        for wy in range(by + 6, int(H * 0.35) - 6, 12):
            for wx in range(bx + 5, bx + bw - 5, 10):
                if random.random() < 0.4:
                    wc = random.choice([
                        (255, 220, 120), (200, 180, 100), (180, 200, 255),
                        (255, 180, 80), (150, 200, 255)
                    ])
                    d.rectangle([wx, wy, wx + 5, wy + 7], fill=wc)
        bx += bw + random.randint(-5, 10)

    # ── Mid-ground buildings ──
    bx = -30
    while bx < W + 50:
        bw = random.randint(70, 140)
        bh = random.randint(150, 320)
        by = int(H * 0.45) - bh
        bc = lerp_color((10, 10, 22), (20, 20, 38), random.random())
        d.rectangle([bx, by, bx + bw, int(H * 0.45)], fill=bc)
        dd.rectangle([bx, by, bx + bw, int(H * 0.45)], fill=60)
        # Windows
        for wy in range(by + 8, int(H * 0.45) - 8, 15):
            for wx in range(bx + 6, bx + bw - 6, 12):
                if random.random() < 0.5:
                    wc = random.choice([
                        (255, 230, 140), (220, 200, 120), (180, 210, 255),
                        (255, 190, 100)
                    ])
                    d.rectangle([wx, wy, wx + 6, wy + 9], fill=wc)
        bx += bw + random.randint(-8, 12)

    # ── Neon signs ──
    neon_signs = [
        (int(W * 0.25), int(H * 0.25), 60, 20, (255, 50, 80)),
        (int(W * 0.60), int(H * 0.20), 50, 15, (80, 200, 255)),
        (int(W * 0.80), int(H * 0.28), 40, 18, (255, 200, 50)),
        (int(W * 0.15), int(H * 0.32), 35, 12, (150, 255, 100)),
    ]
    for nx, ny, nw, nh, nc in neon_signs:
        # Glow
        for r in range(3, 0, -1):
            glow = lerp_color((15, 15, 30), nc, (4 - r) / 4)
            d.rounded_rectangle([nx - nw - r * 5, ny - nh - r * 5,
                                  nx + nw + r * 5, ny + nh + r * 5],
                                 radius=5, fill=glow)
        d.rounded_rectangle([nx - nw, ny - nh, nx + nw, ny + nh],
                             radius=3, fill=nc)
        dd.rectangle([nx - nw, ny - nh, nx + nw, ny + nh], fill=55)

    # ── Street/road (perspective) ──
    road_top = int(H * 0.45)
    for y in range(road_top, H):
        t = (y - road_top) / (H - road_top)
        c = lerp_color((20, 20, 30), (35, 35, 45), t)
        d.line([(0, y), (W, y)], fill=c)
        dd.line([(0, y), (W, y)], fill=int(60 + t * 195))

    # Wet road reflections
    for i in range(100):
        rx = random.randint(0, W)
        ry = random.randint(road_top + 20, H)
        rw = random.randint(10, 40)
        rc = random.choice([
            (60, 40, 45), (40, 50, 60), (50, 45, 35), (45, 55, 65)
        ])
        d.line([(rx, ry), (rx + rw, ry)], fill=rc, width=1)

    # ── Street lamps with glow ──
    lamps = [(int(W * 0.12), int(H * 0.28), 130),
             (int(W * 0.35), int(H * 0.32), 120),
             (int(W * 0.65), int(H * 0.30), 125),
             (int(W * 0.88), int(H * 0.29), 128)]
    for lx, ly, ldepth in lamps:
        d.rectangle([lx - 2, ly, lx + 2, int(H * 0.50)], fill=(40, 40, 50))
        dd.rectangle([lx - 2, ly, lx + 2, int(H * 0.50)], fill=ldepth)
        # Lamp glow — multiple rings
        for r in range(35, 5, -3):
            alpha = (35 - r) / 30
            gc = lerp_color((15, 15, 30), (255, 220, 120), alpha * 0.5)
            d.ellipse([lx - r, ly - r, lx + r, ly + r], fill=gc)

    # ── Cars with headlights (motion) ──
    car_data = [
        (int(W * 0.20), int(H * 0.60), 65, 25, (40, 40, 55), 170, 200),
        (int(W * 0.50), int(H * 0.65), 70, 28, (35, 35, 50), 190, 220),
        (int(W * 0.75), int(H * 0.70), 75, 30, (45, 40, 55), 210, 230),
    ]
    for cx, cy, cw, ch, cc, cdepth, cmotion in car_data:
        d.rounded_rectangle([cx - cw, cy - ch, cx + cw, cy + ch],
                             radius=6, fill=cc)
        dd.rectangle([cx - cw, cy - ch, cx + cw, cy + ch], fill=cdepth)
        dm.rectangle([cx - cw, cy - ch, cx + cw, cy + ch], fill=cmotion)
        # Headlights
        for hl_x in [cx - cw - 3, cx + cw + 3]:
            for r in range(20, 3, -3):
                gc = lerp_color(cc, (255, 240, 180), (20 - r) / 20)
                d.ellipse([hl_x - r, cy - r // 2, hl_x + r, cy + r // 2], fill=gc)
        # Tail lights
        d.ellipse([cx + cw - 5, cy - 4, cx + cw + 2, cy + 4], fill=(255, 30, 30))

    # ── People on sidewalk ──
    people = [
        (int(W * 0.08), int(H * 0.52), 50, 12, 150, 100),
        (int(W * 0.42), int(H * 0.56), 55, 14, 165, 130),
        (int(W * 0.55), int(H * 0.58), 58, 15, 175, 140),
        (int(W * 0.92), int(H * 0.54), 52, 13, 155, 110),
    ]
    for px, py, ph, pw, pdepth, pmotion in people:
        d.rounded_rectangle([px - pw, py - ph, px + pw, py],
                             radius=pw // 2, fill=(25, 25, 35))
        dd.rounded_rectangle([px - pw, py - ph, px + pw, py],
                              radius=pw // 2, fill=pdepth)
        dm.rounded_rectangle([px - pw, py - ph, px + pw, py],
                              radius=pw // 2, fill=pmotion)
        # Head
        hr = pw + 1
        d.ellipse([px - hr, py - ph - hr * 2, px + hr, py - ph],
                   fill=(160, 130, 110))
        dd.ellipse([px - hr, py - ph - hr * 2, px + hr, py - ph], fill=pdepth)
        dm.ellipse([px - hr, py - ph - hr * 2, px + hr, py - ph], fill=pmotion)

    motion = motion.filter(ImageFilter.GaussianBlur(radius=25))
    return img, depth.filter(ImageFilter.GaussianBlur(radius=8)), motion


# ═══════════════════════════════════════════════════════════════════════════════
# Generate all scenes
# ═══════════════════════════════════════════════════════════════════════════════

scenes = {
    'street': make_street,
    'landscape': make_landscape,
    'portrait': make_portrait,
    'lowlight': make_lowlight,
}

for name, make_fn in scenes.items():
    print(f'Generating {name}...')
    scene_img, depth_img, motion_img = make_fn()
    scene_img.save(os.path.join(OUT, f'{name}.jpg'), quality=92)
    depth_img.save(os.path.join(OUT, f'{name}-depth.png'))
    motion_img.save(os.path.join(OUT, f'{name}-motion.png'))
    print(f'  {name}.jpg, {name}-depth.png, {name}-motion.png')

print(f'\nGenerated {len(scenes) * 3} assets in {OUT}')
