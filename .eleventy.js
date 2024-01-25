
module.exports = function eleventyConfig(config) {
	// Passthroughs
    config.addPassthroughCopy("style.css")
    // config.addPassthroughCopy("blog.css")
	config.addPassthroughCopy("images")
    config.addPassthroughCopy("script")
    config.addPassthroughCopy("Resume.pdf")
    config.addGlobalData("url", "https://kaigeffen.com")
};