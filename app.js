'use strict';

const _folder = '/Volumes/GhanaSorted/Test',
			_sort = process.argv.indexOf('--sort') > 0;

const fs = require('fs'),
			path = require('path'),
			moment = require('moment'),
			_ = require('underscore'),
			dateFormat = require('dateformat'), 
			mkdir = require('mkdirp');

const getDirectories = (srcpath) => {

  return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}

let dirs = getDirectories(_folder);
let schoolsMap = new Map();

for(let ind in dirs) {

	let school = dirs[ind];
	let fileArr = [];
	let schoolDirs = getDirectories(_folder + '/' + school);
	
	let schoolMap = {};

	for(let dirInd in schoolDirs) {

		if(schoolDirs[dirInd].indexOf('Not Using') !== -1)
			continue;

		let rootDir = _folder + '/' + school + '/';
		let videoDir = _folder + '/' + school + '/' + schoolDirs[dirInd] + '/';		

		fs.readdir(videoDir, (err, files) => {
	  
	    if (err)
	      throw err;

	    files.forEach(file => {

				if (file.indexOf('.avi')>=0 || file.indexOf('.AVI')>=0) {

				  let month = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'mmm');
				  let minute = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'MM');
				  let seconds = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'ss');
				  let day = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'dd');
				  let yr = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'yyyy');
				  let hr = dateFormat(new Date(fs.statSync(videoDir + file).mtime), 'HH');

				  let datePath = rootDir + month + '/' + day;
					let newFilePath = hr + '-' + minute + '-' + seconds + '_' + [month, day, yr].join('_') + '--' + school.split(' ').join('_') + '.avi';

					if(_sort) {

						if(!fs.existsSync(datePath)) {

						  mkdir(datePath, function() {
								fs.renameSync(videoDir + file, datePath + '/' + newFilePath);
						  });

						}
						else {

								fs.renameSync(videoDir + file, datePath + '/' + newFilePath);

						}

					}
					else {
						if(!fs.existsSync(rootDir + 'All'))
						  mkdir(rootDir + 'All');

						console.log(rootDir + '/All/' + newFilePath)

						// let newName = newFilePath;
						// if(fs.existsSync(rootDir + '/All/ ' + newFilePath))
						// 	newName = 

						fs.rename(videoDir + file, rootDir + '/All/' + newFilePath, (err) => { 
							if(err)
								console.error(err)
						});
					}
	      }
			  
			});

	  });

		// fs.rmdirSync(videoDir);

	schoolsMap.set(school, schoolMap);

	}

}