const fs = require('fs');

const files = fs.readdirSync('srt');
files.forEach(file => {
    const newName = fixFileName(file);
    fs.renameSync('srt/' + file, 'srt/' + newName);
});

function fixFileName(file) {
    return file.replace("Prime Time ", "PrimeTime-");
}

// const files = fs.readdirSync('vtt');
// files.forEach(file => {
//     const newName = fixFileName(file);
//     fs.renameSync('vtt/' + file, 'vtt/' + newName);
// });

// function fixFileName(file) {
//     return file.replace("Prime Time ", "PrimeTime-");
// }


// const files = fs.readdirSync('audio');
// files.forEach(file => {
//     const newName = fixFileName(file);
//     fs.renameSync('audio/' + file, 'audio/' + newName);
// });

// function fixFileName(file) {
//     return file.replace("PrimeTime2", "PrimeTime-2");
// }