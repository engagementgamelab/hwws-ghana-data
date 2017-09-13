'use strict';

const program = require('commander'),
	  colors = require('colors'),
	_rootFolder = '/Volumes/GhanaSorted/JohnnyTest';

	let helpTxt = function(txt) {
		return txt.red.bgYellow;
	  }

program
	.usage('app.js <--arg1 --arg2 ...>')
	.option('--sort', 'Sorts from video folders to mm/dd/time format.')
	.option('--all', 'When used with --sort, re-sorts from "All" folder in each school folder (e.g. --sort --all).')
	.option('--undo', 'Undo the \'sort\' function and place all videos back in "All" folder in each school folder.')
	.parse(process.argv);

if (process.argv.slice(2).length === 0) {
	program.outputHelp(helpTxt);
}

const _sort = program.sort,
	_undo = program.undo;

const fs = require('fs'),
	path = require('path'),
	moment = require('moment'),
	_ = require('underscore'),
	dateFormat = require('dateformat'),
	mkdir = require('mkdirp');

const getDirectories = (srcpath) => {

	return fs.readdirSync(srcpath)
		.filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
}

let dirs = getDirectories(_rootFolder);

if (_undo) {

	let folderFilter = 'JanFebMarAprMayJunJulAugSepOctNovDec';

	for (let ind in dirs) {

		let schoolDir = dirs[ind];
		let fileArr = [];
		let schoolSubDirs = getDirectories(_rootFolder + '/' + schoolDir).filter(folder => folderFilter.indexOf(folder) !== -1);

		for (let month in schoolSubDirs) {
			let monthDir = _rootFolder + '/' + schoolDir + '/' + schoolSubDirs[month];
			let dayDirs = getDirectories(monthDir);

			for (let day in dayDirs) {

				let dayDir = monthDir + "/" + dayDirs[day];

				fs.readdir(dayDir, (err, files) => {

					if (err)
						throw err;

					files.forEach(file => {
						console.log("Moving ".america + file.america + " to 'All'.".america);
						fs.renameSync(dayDir + '/' + file, _rootFolder + '/' + schoolDir + '/All/' + file);
					});
				});

			}
		}
	}


} else {

	let schoolsMap = new Map(),
		sortAll = program.all;

	for (let ind in dirs) {

		let school = dirs[ind];
		let fileArr = [];
		let schoolDirs = getDirectories(_rootFolder + '/' + school);

		if (sortAll)
			schoolDirs = ['All/'];

		// let schoolMap = {};

		for (let dirInd in schoolDirs) {

			if (schoolDirs[dirInd].indexOf('Not Using') !== -1)
				continue;

			let rootDir = _rootFolder + '/' + school + '/';
			let videoDir = _rootFolder + '/' + school + '/' + schoolDirs[dirInd] + '/';

			fs.readdir(videoDir, (err, files) => {

				if (err)
					throw err;

				files.forEach(file => {

					if (file.indexOf('.avi') >= 0 || file.indexOf('.AVI') >= 0) {

						// Create date path
						let month = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'mmm');
						let minute = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'MM');
						let seconds = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'ss');
						let day = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'dd');
						let yr = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'yyyy');
						let hr = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'HH');

						let datePath = rootDir + month + '/' + day;
						let newFilePath = hr + '-' + minute + '-' + seconds + '_' + [month, day, yr].join('_') + '--' + school.split(' ').join('_') + '.avi';

						if (_sort) {

							if (!fs.existsSync(datePath)) {

								mkdir(datePath, function () {
									console.log("Moving " + file + " to " + month + '/' + day);
									fs.renameSync(videoDir + file, datePath + '/' + newFilePath);
								});

							} else {

								console.log("Moving " + file + " to " + month + '/' + day)
								fs.renameSync(videoDir + file, datePath + '/' + newFilePath);

							}

						} else {
							if (!fs.existsSync(rootDir + 'All'))
								mkdir(rootDir + 'All');

							console.log(rootDir + '/All/' + newFilePath);

							fs.rename(videoDir + file, rootDir + '/All/' + newFilePath, (err) => {
								if (err)
									console.error(err)
							});
						}
					}

				});

			});

			// schoolsMap.set(school, schoolMap);

		}
	}

}