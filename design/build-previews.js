// Expands palette-previews.html into a fully static file so it renders
// anywhere, including viewers that do not execute page scripts.
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const src = fs.readFileSync(path.join(dir, "palette-previews.html"), "utf8");

const variants = [
  ["float", "Soda Float", "Mint paper, lavender accent. Coolest and freshest.", "#F5FBF8", "#D3F2E4", "#6D5BD0"],
  ["lilac", "Lilac Cream Soda", "Blush paper, softer lilac accent. Warmest and cosiest.", "#FDF6F9", "#FADCE7", "#8B5FBF"],
  ["grape", "Milky Grape", "Pale periwinkle paper, one saturated grape accent. Strongest contrast.", "#F1F0FA", "#DCD9F5", "#5B2BB8"]
];

const tplMatch = src.match(/<template id="mockTpl">([\s\S]*?)<\/template>/);
if (!tplMatch) throw new Error("template block not found");
const mock = tplMatch[1];

const blocks = variants.map(function (v, i) {
  const swatches = [v[3], v[4], v[5]]
    .map(function (c) { return '<i style="background:' + c + '"></i>'; })
    .join("");
  return '<div class="vbar">' +
    '<span class="n">Option ' + (i + 1) + '</span>' +
    '<span class="t">' + v[1] + '</span>' +
    '<span class="d">' + v[2] + '</span>' +
    '<span class="swatches">' + swatches + '</span>' +
    '</div>\n<div class="mock" data-p="' + v[0] + '">' + mock + '</div>';
}).join("\n\n");

const out = src
  .replace(/<template id="mockTpl">[\s\S]*?<\/template>/, "")
  .replace(/<div id="out"><\/div>/, blocks)
  .replace(/<script>[\s\S]*?<\/script>/, "");

fs.writeFileSync(path.join(dir, "palettes.html"), out, "utf8");
console.log("wrote palettes.html, " + out.length + " bytes, " + variants.length + " variants inlined");
