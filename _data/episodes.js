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

function extractType(s) {
  var index = s.indexOf('-');
  if (index == -1)
    return "Unknown";
  return s.substr(0,index);
}

async function main() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET,
    Prefix:"audio"
  });
  try {
    let isTruncated = true;
    const episodeList = [];
    const types = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);

      Contents.forEach((c) => {
        const episodeName = c.Key.replace("audio/","");
        const type = extractType(episodeName);
        if (!types.includes(type))
          types.push(type);

        let episodeObject = {
          title: episodeName.replace('.ogg',''),
          audio: '/audio/' + episodeName,
          vtt: '/subtitles/' + episodeName.replace('.ogg', '.vtt'),
          srt: '/subtitles/' + episodeName.replace('.ogg','.srt'),
          tags: [],
          type: type,
        };
        episodeObject.date = tryParseDate(episodeObject.title.replace(type+'-',''));
        if (episodeObject.date !== null && episodeObject.date < october3rd ) {
          episodeObject.tags.push("old");
        }
        episodeObject.tags.push(type);

        episodeList.push(episodeObject);
      });
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }

    return {
      episodes: episodeList,
      types: types
    };
  } catch (err) {
    console.error(err);
    return [];
  }
}

module.exports = main;