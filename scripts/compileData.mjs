// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
// Auth is loaded from the environment variables

//TODO: IF CI no do this
//import 'dotenv/config';
import * as fs from 'fs';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";


//TODO ENV this
const client = new S3Client({region:"us-east-1"});

const main = async () => {
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
          vtt: '/vtt/' + episode,
          srt: '/srt/' + episode.replace('.vtt','.srt'),
        }
      }));
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }
    fs.writeFileSync('_data\\episodes.json', JSON.stringify(episodeList));
  } catch (err) {
    console.error(err);
  }
};
main();