// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
// Auth is loaded from the environment variables
if (!process.env.CI)
  require('dotenv').config();

const fs = require('fs');
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

//TODO ENV this
const client = new S3Client({region:"us-east-1"});

async function main() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET,
    Prefix:"vtt"
  });
  try {
    let isTruncated = true;

    let episodeList = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
      episodeList = episodeList.concat(episodeList, Contents.map((c) => {
        const episode = c.Key.replace("vtt/","");
        return {
          title: episode.replace('.vtt',''),
          audio: '/audio/' + episode.replace('.vtt','.ogg'),
          vtt: '/subtitles/' + episode,
          srt: '/subtitles/' + episode.replace('.vtt','.srt'),
        }
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