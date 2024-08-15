const fs = require('fs');
const axios = require('axios'); // For downloading album art & data
const jimp = require('jimp'); // For converting album art to PNG
/**
 * Formats the JSON data according to the Encore format and saves it to the specified output directory.
 *
 * @param {Object} jsonData - The JSON data to be formatted.
 * @param {string} outputDirectoryPath - The path to the directory where the formatted data will be saved.
 * @param {Array<string>} songsToInclude - An array of song names to include in the formatted data. If not provided, all songs will be included.
 * @param {boolean} verbose - A flag indicating whether verbose output should be generated during the formatting process.
 * @return {void}
 */
function format(jsonData, outputDirectoryPath, songsToInclude, verbose) {



    try {




        for (const song of songsToInclude) {

            if (verbose) console.log(`Formatting song: "${song}"...`);

            const outputFolder = `${outputDirectoryPath}/${jsonData[song]["track"]["an"]} - ${jsonData[song]["track"]["tt"]}`;
            // Create output directory
            fs.mkdirSync(outputFolder, { recursive: true });

            // Download of album art and data of song
            if (verbose) console.log("Downloading album art and data of song...");
            axios.get(jsonData[song]["track"]["au"], { responseType: 'arraybuffer' }).then((response) => {

                // Save album art
                if (verbose) console.log("Downloaded album art. Converting to PNG...");
                // Convert album art to PNG
                jimp.read(Buffer.from(response.data, "binary"), (error, image) => {
                    if (error) {
                        console.error(error);
                        process.exit(4);
                    } else
                        image.write(outputFolder + "/cover.png");
                })

            }).catch((error) => {

                console.error(error);
                process.exit(4);
            })

            // Get Data of song
            if (verbose) console.log("Downloading data of song...");
            axios.get(jsonData[song]["track"]["mu"]).then((response) => {

                if (verbose) console.log("Downloaded data of song.");
                fs.writeFileSync(outputFolder + "/song.dat", response.data);

            }).catch((error) => {

                console.error(error);
                process.exit(4);
            });


            const outputData = {};

            // Create output directory

            const songTrackData = jsonData[song]["track"];

            // Copy song data
            outputData["title"] = songTrackData["tt"];
            outputData["artist"] = songTrackData["an"];
            outputData["preview_start_time"] = JSON.parse(songTrackData["qi"])["preview"]["starttime"];
            outputData["release_year"] = songTrackData["ry"];
            outputData["source"] = "Fortnite Festival";
            outputData["album"] = "";
            outputData["loading_phrase"] = "Woah it's an encore in here!";
            outputData["genre"] = songTrackData["ge"] || "";
            outputData["charters"] = ["Harmonix, Rythm Authors"];
            outputData["length"] = songTrackData["dn"];
            outputData["icon_drums"] = songTrackData["sid"];
            outputData["icon_guitar"] = songTrackData["sig"];
            outputData["icon_bass"] = songTrackData["sib"];
            outputData["icon_vocals"] = songTrackData["siv"];

            // Difficulty
            outputData["diff"] = {
                "drums": songTrackData["ins"]["pd"],
                "bass": songTrackData["ins"]["pb"],
                "guitar": songTrackData["ins"]["pg"],
                "vocals": songTrackData["ins"]["vl"],
                "plastic_guitar": songTrackData["ins"]["gr"],
                "plastic_bass": songTrackData["ins"]["ba"],
                "plastic_drums": songTrackData["ins"]["dr"]
            };

            outputData["midi"] = "notes.mid";
            outputData["art"] = "cover.png";

            outputData["stems"] = {
                "drums": [
                    "drums_1.ogg",
                    "drums_2.ogg",
                    "drums_3.ogg"
                ],
                "bass": "bass.ogg",
                "lead": "lead.ogg",
                "vocals": "vocals.ogg",
                "backing": [
                    "backing.ogg",
                    "keys.ogg"
                ]
            }
            if (verbose) console.log("Writing song data to info.json...");


            fs.writeFileSync(outputFolder + "/info.json", JSON.stringify(outputData));















        }
    }
    catch (error) {

        console.error(error);
        process.exit(4);
    }
}

module.exports = { format }