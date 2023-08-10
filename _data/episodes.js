// https://florian.ec/blog/eleventy-data-pages/
// Why no async, because I don't care.

module.exports = function() {
    const fs = require('fs');
    const episodes = fs.readdirSync('vtt');

    const data = episodes.map(episode => {
        return {
            title: episode.replace('.vtt',''),
            audio: '/audio/' + episode.replace('.vtt','.ogg'),
            vtt: '/vtt/' + episode,
            srt: '/srt/' + episode.replace('.vtt','.srt'),
        }
    });
    return data;
}