const mathjaxPlugin = require("eleventy-plugin-mathjax")
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")

module.exports = function eleventyConfig(config) {
    // Enables MathJax to render Latex
    config.addPlugin(mathjaxPlugin)

    // Enables code syntax highlighting
    config.addPlugin(syntaxHighlight)
	
    // Passthroughs
    config.addPassthroughCopy("style.css")
    // config.addPassthroughCopy("blog.css")
	config.addPassthroughCopy("assets")
    config.addPassthroughCopy("script")
    config.addGlobalData("url", "https://kaigeffen.com")
};
