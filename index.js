// Import needed modules
const fs = require('fs');
const argFormat = require('./argFormat.js');

// Read args for json file
if (
    ((
        process.argv.indexOf("-i") == -1 || process.argv.length <= process.argv.indexOf("-i") // Checks to see if the input flag is set AND that there is something specified
    ) &&
    !process.argv.some(arg => arg.startsWith("--input="))) ||
    process.argv.indexOf("-h") != -1
)
{

    console.log(
        process.argv.indexOf("-i") == -1 || process.argv.length <= process.argv.indexOf("-i") // Checks to see if the input flag is set AND that there is something specified
    )

    console.log(!process.argv.some(arg => arg.startsWith("--input=")))

    console.log(process.argv.indexOf("-h") != -1)

    // Documentation
    console.log("Festival JSON Converter");
    console.log("");
    console.log(`Usage: node ${process.argv[1]} -i <inputfile> [options]`);
    console.log("The input file should be in json format");
    console.log("The output folder will contain the formatted song data");

    console.log("Options:");
    console.log("-n --no-download: Do not download album art or data");
    console.log("-v --verbose: Print verbose output");
    console.log("-f --format=<encore|clonehero>: Format for output. Default is encore");
    console.log("-o --output=<directory>: Output directory. Default is current directory");
    console.log("-d --inDex=<songname>: Comma-separated list of songs to include. Default is all songs");

    console.log("Return Codes")
    console.log("0: Success");
    console.log("1: Argument Syntax Error");
    console.log("2: File Not Found");
    console.log("3: JSON Parse Error");
    console.log("4: Data Download Error");
    console.log("5: Write Error");
    console.log("6: JSON formatting error");
    process.exit(1);
}

const inputFilePath = argFormat.getValue("input", "i");
const outputDirectoryPath = argFormat.getValue("output", "o") || ".";
const verbose = argFormat.getBool("verbose", "v");

if (verbose) console.log("Checking input file...");
// Validate JSON file
if (!fs.existsSync(inputFilePath)) {
    console.error(`File not found: ${inputFilePath}`);
    process.exit(2);
}

const inputData = fs.readFileSync(inputFilePath).toString();
if (inputData.length == 0) {
    console.error(`File is empty: ${inputFilePath}`);
    process.exit(3);
}

try {
    const data = JSON.parse(inputData);
} catch (error) {
    console.error(`Invalid JSON data: ${error}`);
    process.exit(3);
}

const jsonData = JSON.parse(inputData);

if (verbose) console.log("Checking output directory...");
// Validate output directory
if (!fs.existsSync(outputDirectoryPath)) {
    fs.mkdirSync(outputDirectoryPath);
}
// Check if output directory is empty
if (fs.readdirSync(outputDirectoryPath).length > 0) {
    console.error(`Directory not empty: ${outputDirectoryPath}`);
    process.exit(2);
}

if (verbose) console.log("Validating song JSON data...");
// Validate song data
const jsonDataStructure = require('./songReqParams.json');

let songsToInclude = [];
if (argFormat.getValue("inDex", "d")) {
    songsToInclude = argFormat.getValue("inDex", "d").split(",");
} else {
    songsToInclude = Object.keys(jsonData);
}

for (const song of songsToInclude) {
    if (!jsonData.hasOwnProperty(song)) {
        console.error(`Missing Song: ${song}`);
        process.exit(6);
        return;
    }
    const songData = jsonData[song];
    // First manually check _title, since it's the only other key that can be missing
    if (!songData.hasOwnProperty("_title")) {
        console.error(`Missing Key: _title in ${song}`);
        process.exit(6);
        return;
    }
    for (const [key, value] of Object.entries(jsonDataStructure.track)) {
        if (!songData.track.hasOwnProperty(key)) {
            console.error(`Missing Key: ${key} in ${song}`);
            process.exit(6);
            return;
        }
        if (typeof(songData.track[key]) != value) {
            console.error(`Invalid Type: ${key} in ${song}`);
            process.exit(6);
            return;
        }
    }
}

// Import the formatter
const formatter = require(`./formatters/${argFormat.getValue("format", "f") || "encore"}.js`);
formatter.format(jsonData, outputDirectoryPath, songsToInclude, verbose);