import axios from 'axios';
import PQueue from 'p-queue';

    const MAX_CONCURRENT_DOWNLOADS = 5;
    const MAX_RETRY_ATTEMPTS = 3;
    const TIMEOUT_MS = 10000; // 10 seconds
    const urls = [
        'https://freetestdata.com/wp-content/uploads/2021/09/1-MB-DOC.doc',
        'https://freetestdata.com/wp-content/uploads/2022/11/Free_Test_Data_10.5MB_PDF.pdf',
        'https://freetestdata.com/wp-content/uploads/2022/02/Free_Test_Data_15MB_MP4.mp4',
        'https://admin.bet-makers.com/files/b04e9482-ba83-4b09-8f35-e889ad5a2a6c.jpg',
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://www.learningcontainer.com/download/sample-mp4-video-file-download-for-testing/?wpdmdl=2727&refresh=64d1d134e3c431691472180'
        // Add more URLs here
    ];

    // Added for update table in same place while using logging version 2 for logging version 1 remove '+ 4'
    const TABLE_LENGTH = urls.length + 4;

    const queue = new PQueue({ concurrency: MAX_CONCURRENT_DOWNLOADS });

    const progress = {};

    const statistics = {};

    async function downloadFile(url, file_key) {
        let attempt = 1;
        let finished = false;

        while (attempt <= MAX_RETRY_ATTEMPTS && !finished) {
            try {

                await axios.get(url, {
                    signal: AbortSignal.timeout(TIMEOUT_MS), // Abort request after TIMEOUT_MS
                    onDownloadProgress: (progressEvent) => {
                        // Update progress
                        if (!statistics[file_key]) statistics[file_key] = {
                            start_time: Date.now()
                        }
                        const percentage = (progressEvent.loaded / progressEvent.total) * 100;
                        if (percentage) {
                            progress[file_key].percentage = Number(percentage.toFixed(2))
                            progress[file_key].status = 'Downloading'
                            progress[file_key].time = new Date().toLocaleString()
                        };
                        updateProgressDisplay();
                    },
                })


                finished = true;
                progress[file_key].status = 'Downloaded'
                progress[file_key].error = 'No Error'
                statistics[file_key].status = true
                statistics[file_key].end_time = Date.now()
                updateProgressDisplay();

            } catch (error) {
                if (error.code === 'ERR_CANCELED') {
                    finished = true;
                    progress[file_key].error = `Aborted due to timeout. - Error message: ${error.message}`
                    progress[file_key].status = `Canceled`
                    statistics[file_key].status = false
                } else {
                    progress[file_key].status = `Retrying... (${attempt}/${MAX_RETRY_ATTEMPTS})`
                    progress[file_key].error = `Error message: ${error.message}`
                    statistics[file_key].status = false
                }
                updateProgressDisplay();

                attempt++;
            }
        }

        if (!finished) {
            progress[file_key].status = `Failed after ${MAX_RETRY_ATTEMPTS} attempts.`
            statistics[file_key].status = false
        }

        updateProgressDisplay();
    }

    function updateProgressDisplay() {
        // Logging version 1 Using process.stdout to display progress


        // Logging version 2 using console.table
        console.table(progress)
        process.stdout.moveCursor(0, -TABLE_LENGTH)
    }

    urls.forEach((url, i) => {
        // console.log(`File ${i+1}: ${url}`)
        process.stdout.write(`File ${i + 1}: ${url}\n`)
        const file_key = `file${i + 1}`
        progress[file_key] = {
            percentage: 0.000,
            status: 'Waiting for queue',
            error: 'No Error',
            time: new Date().toLocaleString()
        };
        queue.add(() => downloadFile(url, file_key));
    });
    console.log('\n')
    console.log('Max concurrent download:', MAX_CONCURRENT_DOWNLOADS)
    console.log('Max retry attempts:', MAX_RETRY_ATTEMPTS)
    console.log('File download timeout:', TIMEOUT_MS / 1000, 'seconds')

    process.stdout.write(`\nSTART DOWNLOADING\n\n`)

    // uncomment next row for logging version 1
    // process.stdout.write(`File # ------- Progress ----- Status ---------------------  Error ---------------------------- \n\n`)

    queue.onIdle().then(() => {
        process.stdout.moveCursor(0, TABLE_LENGTH)
        console.log('\nAll downloads completed.');
        // Generate and log statistics here
        generateStatistics()

    }).catch(error => {
        console.error('An error occurred:', error);
    });


    function generateStatistics() {
        let stats = {
            downloads: 0,
            fails: 0,
            avg_time: '0ms',
        }
        let all_time = 0
        for (const file_key in statistics) {
            if (statistics[file_key].status) {
                stats.downloads++
                all_time += statistics[file_key].end_time - statistics[file_key].start_time
            } else {
                stats.fails++
            }
        }
        if (stats.downloads) {
            stats.avg_time = Math.round(all_time / stats.downloads) + 'ms'
        }
        console.log(`\nThe total number of files downloaded - ${stats.downloads}/${urls.length}`);
        console.log(`Failed downloads                     - ${stats.fails}`);
        console.log(`Average download time                - ${stats.avg_time}`);
    }