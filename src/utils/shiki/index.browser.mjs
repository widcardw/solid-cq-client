import { FontStyle } from 'shiki';

function measureFont([fontName, fontSize]) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.font = `${fontSize}px "${fontName}"`;
  const capMMeasurement = ctx.measureText("M");
  const characters = [];
  for (let i = 65; i <= 90; i += 1) {
    characters.push(String.fromCharCode(i));
  }
  for (let i = 97; i <= 122; i += 1) {
    characters.push(String.fromCharCode(i));
  }
  let highestAscent = 0;
  let lowestDescent = 0;
  characters.forEach((char) => {
    const m = ctx.measureText(char);
    if (m.actualBoundingBoxAscent > highestAscent) {
      highestAscent = m.actualBoundingBoxAscent;
    }
    if (m.actualBoundingBoxDescent > lowestDescent) {
      lowestDescent = m.actualBoundingBoxDescent;
    }
  });
  return {
    width: capMMeasurement.width,
    height: highestAscent + lowestDescent
  };
}
async function measureMonospaceTypeface(fontNameStr, fontSize, remoteFontCSSURL) {
  {
    return measureFont([fontNameStr, fontSize]);
  }
}

const collectTokenOptions = (options) => {
  return Object.entries(options).reduce(
    (acc, [key, value]) => value ? `${acc}${key}="${value}" ` : acc,
    ""
  ).trim();
};
function getTokenSVGAttributes(token) {
  const options = {
    fill: "#fff",
    opacity: void 0,
    "font-weight": void 0,
    "font-style": void 0
  };
  if (token.fontStyle === FontStyle.Bold) {
    options["font-weight"] = "bold";
  }
  if (token.fontStyle === FontStyle.Italic) {
    options["font-style"] = "italic";
  }
  if (!token.color) {
    return collectTokenOptions(options);
  }
  if (token.color.slice(1).length <= 6) {
    options.fill = token.color;
  } else if (token.color.slice(1).length === 8) {
    const opacity = parseInt(token.color.slice(1 + 6), 16) / 255;
    const roughRoundedOpacity = String(Math.floor(opacity * 100) / 100);
    options.fill = token.color.slice(0, 1 + 6);
    options.opacity = roughRoundedOpacity;
  }
  return collectTokenOptions(options);
}
const htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function escapeHtml(html) {
  return html.replace(/[&<>"']/g, (chr) => htmlEscapes[chr]);
}
async function getSVGRenderer(options) {
  const fontNameStr = typeof options.fontFamily === "string" ? options.fontFamily : options.fontFamily.name;
  typeof options.fontFamily === "string" ? void 0 : options.fontFamily.cssURL;
  const fontSize = options.fontSize ?? 16;
  const lineHeightToFontSizeRatio = options.lineHeightToFontSizeRatio ?? 1.4;
  const _bg = options.bg ?? "#fff";
  const bgCornerRadius = options.bgCornerRadius ?? 4;
  const bgSideCharPadding = options.bgSideCharPadding ?? 4;
  const bgVerticalCharPadding = options.bgVerticalCharPadding ?? 2;
  const bgFillOpacity = options.bgFillOpacity ?? 1;
  const measurement = await measureMonospaceTypeface(fontNameStr, fontSize);
  const lineheight = measurement.height * lineHeightToFontSizeRatio;
  return {
    renderToSVG(lines, { bg } = { bg: _bg }) {
      let longestLineTextLength = 0;
      lines.forEach((lTokens) => {
        let lineTextLength = 0;
        lTokens.forEach((l) => lineTextLength += l.content.length);
        if (lineTextLength > longestLineTextLength) {
          longestLineTextLength = lineTextLength;
        }
      });
      const bgWidth = Math.max(
        options.bgMinWidth ?? 0,
        (longestLineTextLength + bgSideCharPadding * 2) * measurement.width
      );
      const bgHeight = (lines.length + bgVerticalCharPadding * 2) * lineheight;
      let svg = `<svg viewBox="0 0 ${bgWidth} ${bgHeight}" width="${bgWidth}" height="${bgHeight}" xmlns="http://www.w3.org/2000/svg">
`;
      svg += `<rect id="bg" fill="${bg}" width="${bgWidth}" height="${bgHeight}" rx="${bgCornerRadius}" fill-opacity="${bgFillOpacity}"></rect>`;
      svg += `<g id="tokens" transform="translate(${measurement.width * bgSideCharPadding}, ${lineheight * bgVerticalCharPadding - 3})">`;
      lines.forEach((l, index) => {
        if (l.length === 0) {
          svg += "\n";
        } else {
          svg += `<text font-family="${fontNameStr}" font-size="${fontSize}" y="${lineheight * (index + 1)}">
`;
          let indent = 0;
          l.forEach((token) => {
            const tokenAttributes = getTokenSVGAttributes(token);
            if (token.content.startsWith(" ") && token.content.search(/\S/) !== -1) {
              const firstNonWhitespaceIndex = token.content.search(/\S/);
              svg += `<tspan x="${indent * measurement.width}" ${tokenAttributes}>${escapeHtml(
                token.content.slice(0, firstNonWhitespaceIndex)
              )}</tspan>`;
              svg += `<tspan x="${(indent + firstNonWhitespaceIndex) * measurement.width}" ${tokenAttributes}>${escapeHtml(
                token.content.slice(firstNonWhitespaceIndex)
              )}</tspan>`;
            } else {
              svg += `<tspan x="${indent * measurement.width}" ${tokenAttributes}>${escapeHtml(
                token.content
              )}</tspan>`;
            }
            indent += token.content.length;
          });
          svg += "\n</text>\n";
        }
      });
      svg = svg.replace(/\n*$/, "");
      svg += "</g>";
      svg += "\n</svg>\n";
      return svg;
    }
  };
}

export { getSVGRenderer };
