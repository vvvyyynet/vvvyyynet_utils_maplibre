module.exports = {
	repositoryUrl: 'https://github.com/vvvyyynet/vvvyyynet_utils_maplibre.git',

	branches: [
		'main', // stable release branch
		{ name: 'beta', prerelease: true } // prerelease branch (beta)
	],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		'@semantic-release/changelog',
		'@semantic-release/git'
	],
	commitAnalyzer: {
		preset: 'conventionalcommits',
		releaseRules: [
			{
				type: 'feat',
				scope: '*',
				release: 'minor'
			},
			{
				type: 'fix',
				scope: '*',
				release: 'patch'
			},
			{
				type: 'BREAKING CHANGE',
				release: 'minor'
			}
		]
	}
};
