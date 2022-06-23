const { name, version } = require('../../package.json');

const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.myTemplate`;
// console.log(downloadDirectory);
module.exports = {
    name,
    version,
    downloadDirectory
};


