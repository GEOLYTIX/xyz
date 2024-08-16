/**
 * @module /utils/safeEnvReplace
 */

/**
 * @function safeEnvReplace 
 * @description
The function takes an object (obj) as input. This object may contain values with ${...} patterns that need to be replaced with environment variable values.

It first converts the input object to a JSON string. This allows us to process the entire object structure as a single string.

The string is then split into chunks using a regex. This regex looks for ${...} patterns and splits the string so that these patterns are isolated in their own chunks.

We set a MAX_REPLACEMENTS constant to limit the number of replacements, preventing potential DOS attacks from inputs with an excessive number of ${...} patterns.

We use `Array.prototype.map()` to process each chunk:

If a chunk is a ${...} pattern (starts with '${' and ends with '}'):

We increment a counter and check if we've exceeded MAX_REPLACEMENTS.
We extract the content inside ${...} and prepend 'SRC_' to create the environment variable key.
We look up this key in process.env and return its value (or an empty string if not found).

If a chunk is not a ${...} pattern, we return it unchanged.

After processing all chunks, we join them back into a single string.
Finally, we parse this string back into an object and return it.
 * @param {Obeckt} obj 
 * @returns {json} safeObject 
 */
module.exports = function safeEnvReplace(obj) {
    // Convert the input object to a JSON string
    const str = JSON.stringify(obj);

    // Split the string into chunks
    // This regex splits on ${...} patterns, keeping the patterns as separate chunks
    const chunks = str.split(/(\$\{[^}]+\})/);

    // Set a maximum number of replacements to prevent potential DOS attacks
    const MAX_REPLACEMENTS = 1000; // Adjust this number based on your needs
    let replacementCount = 0;

    // Process each chunk
    const result = chunks.map(chunk => {
        // Check if the chunk is a ${...} pattern
        if (chunk.startsWith('${') && chunk.endsWith('}')) {
            // Increment and check the replacement count
            if (++replacementCount > MAX_REPLACEMENTS) {
                throw new Error('Too many replacements');
            }

            // Extract the environment variable name and add the 'SRC_' prefix
            const envKey = `SRC_${chunk.slice(2, -1)}`;

            // Return the environment variable value, or an empty string if not found
            return process.env[envKey] || '';
        }

        // If it's not a ${...} pattern, return the chunk as-is
        return chunk;
    }).join(''); // Join all processed chunks back into a single string

    // Parse the resulting string back into an object and return it
    return JSON.parse(result);
}