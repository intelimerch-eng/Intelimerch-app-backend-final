const predefinedCodes = {
    black: "BLK",
    white: "WHT",
    red: "RED",
    blue: "BLU",
    green: "GRN",
    yellow: "YLW",
    orange: "ORG",
    purple: "PPL",
    pink: "PNK",
    brown: "BRN",
    grey: "GRY",
    gray: "GRY",

    small: "SM",
    medium: "MD",
    large: "LG",
    "extra small": "XS",
    "extra large": "XL",
    "double extra large": "XXL"
};

function generateCode(value) {
    if (!value) return "";

    const normalized = value.trim().toLowerCase();

    // Return predefined code if available
    if (predefinedCodes[normalized]) {
        return predefinedCodes[normalized];
    }

    const words = normalized.split(/\s+/);

    // Multi-word values
    if (words.length > 1) {
        return words
            .map(word => word[0])
            .join("")
            .toUpperCase();
    }

    // Single-word values
    const word = words[0];

    // Remove vowels after first letter
    let code = word[0];
    for (let i = 1; i < word.length; i++) {
        if (!"aeiou".includes(word[i])) {
            code += word[i];
        }
        if (code.length === 3) break;
    }

    return code.toUpperCase();
}


module.exports = generateCode