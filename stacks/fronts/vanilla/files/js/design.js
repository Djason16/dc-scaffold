// Design of the site, read before the page is shown (HTML / CSS / JS has no build): see dc-scaffold.config.js
//   design: true   the theme of DC Scaffold (js/dc-scaffold/theme.css) and its welcome page (js/dc-scaffold/index.js)
//   design: false  the simple style of assets/css only, without loader
const design = window.DC_SCAFFOLD?.design !== false
document.documentElement.dataset.design = design ? 'dc-scaffold' : 'simple'
if (design) document.write('<link rel="stylesheet" href="/js/dc-scaffold/theme.css">')
else document.write('<style>[data-loader] { display: none; }</style>')
