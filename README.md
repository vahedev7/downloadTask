Concurrent File Downloader
This is a JavaScript script that demonstrates how to download multiple files concurrently using the Axios library. The script also handles progress tracking, retries, and generates statistics about the downloads.

Table of Contents
Introduction
Prerequisites
Installation
Usage
Configuration
Output
License
Introduction
Downloading multiple files concurrently can improve the efficiency of your download process, especially when dealing with slow or unreliable connections. This script uses the Axios library for making HTTP requests and the PQueue library to manage the concurrency of downloads. It also implements retry logic for failed downloads and tracks the progress of each download.

Prerequisites
Node.js: Make sure you have Node.js installed on your system. You can download it from the official Node.js website.
Installation
Clone this repository or download the script to your local machine.
Open a terminal and navigate to the script's directory.
Install the required dependencies using the following command:
bash
Copy code
npm install
Usage
Modify the urls array in the script with the URLs of the files you want to download concurrently.
Adjust the configuration constants (MAX_CONCURRENT_DOWNLOADS, MAX_RETRY_ATTEMPTS, TIMEOUT_MS) according to your requirements.
Open a terminal and navigate to the script's directory.
Run the script using the following command:
bash
Copy code
node script.js
The script will start downloading the files concurrently and display progress information in the console.

Configuration
You can configure the behavior of the script by adjusting the following constants in the script:

MAX_CONCURRENT_DOWNLOADS: Maximum number of downloads to run concurrently.
MAX_RETRY_ATTEMPTS: Maximum number of retry attempts for failed downloads.
TIMEOUT_MS: Timeout in milliseconds for each download request.
Output
The script provides two types of logging for progress tracking:

Logging Version 1: Progress is displayed using process.stdout. Uncomment the relevant line to enable this logging.
Logging Version 2: Progress is displayed using console.table.
Once all downloads are completed, the script will display statistics about the downloads, including the total number of successful downloads, failed downloads, and average download time.

License
This project is licensed under the MIT License.
