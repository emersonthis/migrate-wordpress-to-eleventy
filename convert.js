const parseString = require('xml2js').parseString;
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const fs = require('fs');

const exportPath = process.argv[2];

const fileContents = fs.readFileSync(exportPath, 'utf8');

let json = null;

parseString(fileContents, function (err, result) {
    json = result
});

const posts = json.rss.channel[0].item;

for (let i=0; i<posts.length; i++) {
	const post = posts[i];

	let fileString = `---\ntitle: "${post.title}"\n`;

	fileString += 'tags:\n';

	post.category.map( cat => {
		if (cat._ !== 'Uncategorized') {
			fileString += `  - "${cat._}"\n`;
		}
	});
	fileString += `---\n\n`;

	const htmlContent = post['content:encoded'][0];
	fileString += turndownService.turndown(htmlContent);

	const postDate = post['wp:post_date'][0].split(' ')[0];
	const fileName = `${postDate}-${post['wp:post_name']}`;

	fs.writeFile(
		'./output/'+fileName+'.md', 
		fileString, 
		'utf8', 
		(err) => {
			if (err) {
				console.error(err);
			}
		}
	);

}

console.log('Done!');