// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
// https://stackoverflow.com/questions/43314871/how-to-trigger-my-lambda-function-once-the-file-is-uploaded-to-s3-bucket
// https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
// https://github.com/awsdocs/aws-doc-sdk-examples/tree/main/javascriptv3/example_code/cross-services/transcription-app
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/transcribe-examples-section.html
// https://docs.aws.amazon.com/transcribe/latest/APIReference/API_StartTranscriptionJob.html#transcribe-StartTranscriptionJob-request-OutputKey
// Auth is loaded from the environment variables


// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
// Auth is loaded from the environment variables


/*
TODO:
- Cleanup
- Fix ACL somehow once transcription done?
- Move processed files to done folder so we dont accidentally re-do them.
*/
if (!process.env || !process.env.CI)
{
    var test = require('dotenv').config();
}

// TODO: Get from Config
const REGION = 'us-east-1';

const fs = require('fs');
const fsP = require("fs/promises");
const path = require('path');
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require("@aws-sdk/client-s3");

const { TranscribeClient, StartTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");

const client = new S3Client({region:REGION});

// Create an Amazon Transcribe service client object.
const transcribeClient = new TranscribeClient({ region: REGION });

function validateInputFileName(fileName) {
    const extension = path.extname(fileName);
    if (extension !== ".ogg") {
        console.log("skipping non ogg file: " + fileName );
        return false;
    }
    const type = extractType(fileName);
    if (type == "Unknown") {
        console.log("skipping unknown type for: " + fileName );
        return false;
    }

    return true;
}

// TODO: Move to shared
function extractType(s) {
    var index = s.indexOf('-');
    if (index == -1)
      return "Unknown";
    return s.substr(0,index);
}

async function processFiles() {
    //loop through files

    var files = fs.readdirSync('./input');
    for (let fileName of files) {
        if (!validateInputFileName(fileName)) {
            continue;
        }

        //await uploadFile(fileName);
        await queueTranscriptionJob(fileName);
    }
}

async function uploadFile(fileName) {
    console.log("Uploading: " + fileName);
    // Try and have a dedicated folder just for files to be uploaded
    const fileStream = await fsP.readFile("./input/" + fileName);
    console.log(process.env.S3_BUCKET);
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: 'audio/' + fileName,
      Body: fileStream,
      ACL: 'public-read'
    });
    await client.send(command);
}

function getLocaleForFileName(fileName) {
    const type = extractType(fileName).toLowerCase();
    switch (type) {
        case 'primetime':
        // I'm British!
            return 'en-GB';
        default:
            return 'en-US';
    }
}

function getJobNameForFileName(fileName) {
    return path.basename(fileName, path.extname(fileName));
}

async function queueTranscriptionJob(fileName) {
    // Set the parameters
    const params = {
        TranscriptionJobName: getJobNameForFileName(fileName),
        LanguageCode: getLocaleForFileName(fileName),
        MediaFormat: "ogg", // For example, 'wav'
        Media: {
            MediaFileUri: "s3://officehours.probableprime.co.uk/audio/" + fileName,
        },
        OutputBucketName: "officehours.probableprime.co.uk",
        OutputKey: 'subtitles/',
        Subtitles: {
            Formats: ['srt', 'vtt'],
        },
    };
    try {
        const data = await transcribeClient.send(
            new StartTranscriptionJobCommand(params)
        );
        console.log("Success - put", data);
        return data; // For unit tests.
    } catch (err) {
        console.log("Error", err);
    }
}

processFiles();