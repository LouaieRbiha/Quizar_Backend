module.exports = async () => {
	return {
		verbose: true,
		testEnvironment: 'node',
		forceExit: true,
		rootDir: './',
		maxWorkers: 1,
	};
};
