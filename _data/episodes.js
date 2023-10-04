// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
// Auth is loaded from the environment variables
if (!process.env.CI)
  require('dotenv').config();

const fs = require('fs');
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

// https://www.youtube.com/shorts/gWzb84rVg78
const october3rd = new Date("2023-10-03");

//TODO ENV this
const client = new S3Client({region:"us-east-1"});

function tryParseDate(input) {
  let date = new Date(input);
  if(isNaN(date)) {
    return null;
  }
  return date;
}

async function main() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET,
    Prefix:"audio"
  });
  try {
    let isTruncated = true;

    let episodeList = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
      episodeList = episodeList.concat(episodeList, Contents.map((c) => {
        const episode = c.Key.replace("audio/","");
        let episodeObject = {
          title: episode.replace('.ogg',''),
          audio: '/audio/' + episode,
          vtt: '/subtitles/' + episode.replace('.ogg', '.vtt'),
          srt: '/subtitles/' + episode.replace('.ogg','.srt'),
          tags: [],
        };
        episodeObject.date = tryParseDate(episodeObject.title);
        if (episodeObject.date !== null && episodeObject.date < october3rd ) {
          episodeObject.tags.push("old");
        }

        return episodeObject;
      }));
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }
    return episodeList;
  } catch (err) {
    console.error(err);
    return [];
  }
}

module.exports = main;