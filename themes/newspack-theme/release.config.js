module.exports = {
	tagFormat: 'newspack-theme-v${version}',
	branches: [
		'release',
		{ name: 'alpha', prerelease: 'alpha' },
		{ name: 'hotfix/*', prerelease: '${name.replace(/\\//g, "-")}' },
		{ name: 'epic/*', prerelease: '${name.replace(/\\//g, "-")}' },
	],
	prepare: [
		'@semantic-release/changelog',
		'@semantic-release/npm',
		[
			'semantic-release-version-bump',
			{
				files: [
					'newspack-theme/sass/theme-description.scss',
					'newspack-joseph/sass/theme-description.scss',
					'newspack-katharine/sass/theme-description.scss',
					'newspack-nelson/sass/theme-description.scss',
					'newspack-sacha/sass/theme-description.scss',
					'newspack-scott/sass/theme-description.scss',
				],
				callback: 'npm run release:archive',
			},
		],
		{
			path: '@semantic-release/git',
			assets: [
				'package.json',
				'CHANGELOG.md',
				'newspack-theme/sass/theme-description.scss',
				'newspack-joseph/sass/theme-description.scss',
				'newspack-katharine/sass/theme-description.scss',
				'newspack-nelson/sass/theme-description.scss',
				'newspack-sacha/sass/theme-description.scss',
				'newspack-scott/sass/theme-description.scss',
			],
			message:
				'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
		},
	],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[ '@semantic-release/npm', { npmPublish: false } ],
		'semantic-release-version-bump',
		[
			'@semantic-release/github',
			{
				assets: [
					{ path: './release/newspack-theme.zip', label: 'newspack-theme.zip' },
					{ path: './release/newspack-joseph.zip', label: 'newspack-joseph.zip' },
					{ path: './release/newspack-katharine.zip', label: 'newspack-katharine.zip' },
					{ path: './release/newspack-nelson.zip', label: 'newspack-nelson.zip' },
					{ path: './release/newspack-sacha.zip', label: 'newspack-sacha.zip' },
					{ path: './release/newspack-scott.zip', label: 'newspack-scott.zip' },
				],
			},
		],
	],
};
