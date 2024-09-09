import fs from 'fs';
import resolveConfig from 'tailwindcss/resolveConfig.js';
import tailwindConfig from 'tailwindcss/defaultConfig.js';
import * as themes from './public/registry/themes-named.js';

// Resolve Tailwind's full configuration to access the complete color palette
const fullConfig = resolveConfig(tailwindConfig);

// Function to get the HSL value from Tailwind's color palette
function getColorHSL(value) {
  // Check if the value is already an HSL string or needs to be skipped
  if (value.includes('%') || value.includes('rem') || value.includes('px') || value.includes('em')) {
    return value; // Return the value as it is if it's already an HSL or a non-color value
  }

  // Convert underscore notation to Tailwind's hyphenated notation
  const [color, shade] = value.split('_');
  const tailwindColorName = shade ? `${color}-${shade}` : color;

  const colorValue = fullConfig.theme.colors[color]?.[shade] || fullConfig.theme.colors[tailwindColorName];

  if (typeof colorValue === 'string') {
    return hexToHSL(colorValue);
  }
  throw new Error(`Color ${value} not found in Tailwind's color palette.`);
}

// Function to convert HEX to HSL
function hexToHSL(H) {
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length === 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0,
    s = 0,
    l = 0;

  if (delta === 0)
    h = 0;
  else if (cmax === r)
    h = ((g - b) / delta) % 6;
  else if (cmax === g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

// Generate the CSS string
function generateCSS() {
  let css = '';

  Object.keys(themes).forEach(themeName => {
    const theme = themes[themeName];
    const isDarkTheme = themeName.startsWith('dark_');

    // Remove any existing "theme_" or "theme-" prefix
    const baseName = themeName
      .replace(/^dark_/, '')
      .replace(/^theme_/, '')
      .replace(/^theme-/, '')
      .replace(/_/g, '-');

    const className = isDarkTheme
      ? `.dark .theme-${baseName}`
      : `.theme-${baseName}`;

    css += `${className} {\n`;
    Object.keys(theme).forEach(variable => {
      try {
        const hsl = getColorHSL(theme[variable]);
        css += `  --${variable.replace(/_/g, '-')}: ${hsl};\n`;
      } catch (error) {
        console.warn(`Skipping variable --${variable} in ${themeName}: ${error.message}`);
        css += `  --${variable.replace(/_/g, '-')}: ${theme[variable]};\n`; // Include as is if it's not a color
      }
    });
    css += '}\n\n';
  });

  return css;
}



// Specify the output path for the generated CSS
const outputPath = './public/registry/themes.css'

// Write the generated CSS to the file
fs.writeFile(outputPath, generateCSS(), err => {
  if (err) {
    console.error('Error writing CSS file:', err);
  } else {
    console.log(`CSS file successfully generated at ${outputPath}`);
  }
});