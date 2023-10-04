// I copied this from the base blog template. Half of it doesn't seem to be needed.
module.exports = function(eleventyConfig) {

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	eleventyConfig.addFilter("toNeosOutput", function(value) {
		return `${value.title}|${value.audio}|${value.srt}`;
	});


	eleventyConfig.addFilter("notTagged", function(episodes, tags) {
		return episodes.filter(episode => episode.tags.every(t => !tags.includes(t)));
	});

	// https://stevenwoodson.com/blog/a-step-by-step-guide-to-sorting-eleventy-global-data-files-by-date/
	/**
	* Sort by data files `date` field
	*/
	eleventyConfig.addFilter("sortDataByDate", (obj) => {
		return obj.sort((a, b) => {
			return a.date > b.date ? 1 : -1;
		});
	});

	eleventyConfig.addFilter('toJSON', JSON.stringify);

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid",
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content",          // default: "."
			includes: "../_includes",  // default: "_includes"
			data: "../_data",          // default: "_data"
			output: "_site"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};