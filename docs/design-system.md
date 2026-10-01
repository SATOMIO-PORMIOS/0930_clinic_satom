# Design System

## Colors

| Name | Web Color | RGB |
|---|---|---|
| main | `#2E8B7F` | 46, 139, 127 |
| sub | `#6A9199` | 106, 145, 153 |
| lightgreen | `#DCEDEA` | 220, 237, 234 |
| beige | `#EDE4D6` | 237, 228, 214 |
| base | `#F8FAF8` | 248, 250, 248 |
| text | `#263B3A` | 38, 59, 58 |
| white | `#FFFFFF` | 255, 255, 255 |
| HERO | `#FFD700` | 255, 215, 0 |
| holiday | `#DC143C` | 220, 20, 60 |
| black | `#000000` | 0, 0, 0 |
| green | `#C5DF93` | 197, 223, 147 |

### CSS Variables

```css
:root {
  --color-main: #2E8B7F;
  --color-sub: #6A9199;
  --color-lightgreen: #DCEDEA;
  --color-beige: #EDE4D6;
  --color-base: #F8FAF8;
  --color-text: #263B3A;
  --color-white: #FFFFFF;
  --color-hero: #FFD700;
  --color-holiday: #DC143C;
  --color-black: #000000;
  --color-green: #C5DF93;
}
```

## Typography

### TITLE

| Name | Font Size | Line Height |
|---|---:|---|
| HERO | 64px | Auto |
| H2 | 34px | Auto |
| H3 | 24px | Auto |
| navigation | 16px | Auto |
| button | 17px | Auto |

### TEXT

| Name | Font Size | Line Height |
|---|---:|---|
| HERO | 20px | Auto |
| main | 16px | Auto |
| main_L | 18px | Auto |

### CSS Variables

```css
:root {
  --font-title-hero: 64px;
  --font-title-h2: 34px;
  --font-title-h3: 24px;
  --font-title-navigation: 16px;
  --font-title-button: 17px;

  --font-text-hero: 20px;
  --font-text-main: 16px;
  --font-text-main-l: 18px;
}
```

> Figmaの `Auto` の行間は、CSSでは `line-height: normal;` に近い扱いです。
