/**
 * @module /utils/safeEnvReplace
 */

/**
 * @function safeEnvReplace 
 * @description
 * This function safely replaces ${...} patterns in a JSON object with corresponding environment variables. Here's a breakdown of how it works:

1.It starts by converting the input object to a JSON string.

2.It uses a regex to find all ${...} patterns in the string. The regex /${([^}]+)}/g is safer than the original as it doesn't use a greedy quantifier, preventing potential exponential backtracking.

3.For each match:
    - It adds the part of the string before the match to the result.
    - It looks up the corresponding environment variable (prefixed with 'SRC_').
    - It adds the value of the environment variable (or an empty string if not found) to the result.

4. After processing all matches, it adds any remaining part of the string to the result.

5. Finally, it parses the resulting string back into an object.
 * @param {Obeckt} obj 
 * @returns {json} safeObject 
 */
module.exports = function safeEnvReplace(obj) {
    // Convert the input object to a JSON string
    const str = JSON.stringify(obj);

    // Initialize an empty result string
    let result = '';

    // Keep track of where we last ended in the string
    let lastIndex = 0;

    // Define a regex to match ${...} patterns
    // This regex is safer as it doesn't use a greedy quantifier
    const regex = /\$\{([^}]+)\}/g;

    let match;

    // Iterate through all matches in the string
    while ((match = regex.exec(str)) !== null) {
        // Add the part of the string from the last match up to this match
        result += str.slice(lastIndex, match.index);

        // Construct the environment variable key
        // match[1] is the content inside ${...}
        const envKey = `SRC_${match[1]}`;

        // Add the value of the environment variable to the result
        // If the env variable doesn't exist, add an empty string
        result += process.env[envKey] || '';

        // Update the last index to the end of this match
        lastIndex = regex.lastIndex;
    }

    // Add any remaining part of the string after the last match
    result += str.slice(lastIndex);

    // Parse the resulting string back into an object
    return JSON.parse(result);
}