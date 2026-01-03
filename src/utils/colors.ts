export const getColorForFrequency = (freq: number): string => {
  // 0% = green, 25% = yellow, 50% = orange, 100% = dark red
  if (freq <= 25) {
    // 0-25%: green (34, 220, 34) to yellow (234, 179, 8)
    const t = freq / 25;
    const r = Math.round(34 + (234 - 34) * t);
    const g = Math.round(220 + (179 - 220) * t);
    const b = Math.round(34 + (8 - 34) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (freq <= 50) {
    // 25-50%: yellow (234, 179, 8) to orange (249, 115, 22)
    const t = (freq - 25) / 25;
    const r = Math.round(234 + (249 - 234) * t);
    const g = Math.round(179 + (115 - 179) * t);
    const b = Math.round(8 + (22 - 8) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // 50-100%: orange (249, 115, 22) to dark red (153, 27, 27)
    const t = (freq - 50) / 50;
    const r = Math.round(249 + (153 - 249) * t);
    const g = Math.round(115 + (27 - 115) * t);
    const b = Math.round(22 + (27 - 22) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
};
