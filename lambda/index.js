// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
// https://stackoverflow.com/questions/43314871/how-to-trigger-my-lambda-function-once-the-file-is-uploaded-to-s3-bucket
// https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
// https://github.com/awsdocs/aws-doc-sdk-examples/tree/main/javascriptv3/example_code/cross-services/transcription-app
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/transcribe-examples-section.html
// https://docs.aws.amazon.com/transcribe/latest/APIReference/API_StartTranscriptionJob.html#transcribe-StartTranscriptionJob-request-OutputKey
// Auth is loaded from the environment variables
if (!process.env.CI)
  require('dotenv').config();


const { TranscribeClient, StartTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
// Set the AWS Region.
// TODO: How get this from config
const REGION = "REGION"; //e.g. "us-east-1"
// Create an Amazon Transcribe service client object.
const transcribeClient = new TranscribeClient({ region: REGION });

exports.handler = async (event, context) => {
    if (!event.Records || event.Records.length == 0)
        return;
    // Bucket name
    for (const record in event.Records) {
        await processRecord(record);
    }
};

async function processRecord(record) {
    if (!record.s3)
        return;
    const bucketName = record.s3.bucket.name;
    const fileName = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // We do filtering in the event configuration but i'll also do it here just in case, I like doing this so my code has less.... stuff in my brain.
    if (!fileName.includes('.ogg'))
        return;

    // Schedule an AWS Transcription
    // TODO: How do we ensure that we don't do cyclical transcriptions?
    await queueTranscriptionJob(fileName);
}

async function queueTranscriptionJob(fileName) {
    // Set the parameters
    const params = {
        TranscriptionJobName: "JOB_NAME",
        // I'm British!
        LanguageCode: "en-GB", // For example, 'en-US'
        MediaFormat: "ogg", // For example, 'wav'
        Media: {
            MediaFileUri: "SOURCE_LOCATION",
            // For example, "https://transcribe-demo.s3-REGION.amazonaws.com/hello_world.wav"
        },
        OutputBucketName: "OUTPUT_BUCKET_NAME",
        //TODO: we'll need to alter our storage to put VTT and SRT in the same folder. 
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