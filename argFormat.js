/**
 * Retrieves the value of a command line argument based on its long or short form.
 *
 * @param {string} longform - The long form of the command line argument.
 * @param {string} shortform - The short form of the command line argument.
 * @return {string|undefined} The value of the command line argument, or undefined if not found.
 */
function getValue(longform, shortform) {
    if (!longform)
    {
        return undefined;
    }

    if (!shortform)
    {
        return undefined;
    }
    if (process.argv.some(arg => arg.startsWith(`--${longform}=`))) {
        // Get the value of the long form
        return process.argv[process.argv.findIndex(arg => arg.startsWith(`--${longform}=`))].split("=")[1];
    }

    if (process.argv.some(arg => arg.startsWith(`-${shortform}`))) {
        // Get the value of the short form
        return process.argv[process.argv.findIndex(arg => arg.startsWith(`-${shortform}`)) + 1];
    }
    return undefined;


}

/**
 * Retrieves the boolean value of a command line argument based on its long or short form.
 *
 * @param {string} longform - The long form of the command line argument.
 * @param {string} shortform - The short form of the command line argument.
 * @return {boolean|undefined} The boolean value of the command line argument, or undefined if not found.
 */
function getBool(longform, shortform) {
    if (!longform)
    {
        return undefined;
    }

    if (!shortform)
    {
        return undefined;
    }

    if (process.argv.indexOf(`--${longform}`) != -1) {
        return true; // Value is found, pass true
    }

    
    if (process.argv.indexOf(`-${shortform}`) != -1)  { // Standalone switch, e.g. just -n
        return true; // Value is found, pass true
    }
    

    // Mixed form e.g. -nv
    var tempArgsStore = process.argv;
    const mixedArgRegex = /^-([a-z0-9]+)$/
    while (tempArgsStore.some(arg => mixedArgRegex.test(arg))) { // Loop through all arguments
        const index = process.argv.findIndex(arg => mixedArgRegex.test(arg))
        const tempString = tempArgsStore[index];
        if (tempString.split("").some(char => char == shortform))
        {
            return true;
        }

        tempArgsStore.splice(index, 1);
    }

    return false;
        
}


module.exports = {getValue, getBool}