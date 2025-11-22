// https://github.com/zotero/utilities/blob/master/utilities.js
// Cleans a title, converting it to title case and replacing " :" with ":"
function capitalizeTitle(string) {
    const skipWords = ["but", "or", "yet", "so", "for", "and", "nor", "a", "an",
        "the", "at", "by", "from", "in", "into", "of", "on", "to", "with", "up",
        "down", "as"];

    // This may only match a single character
    const delimiterRegexp = /([ \/\u002D\u00AD\u2010-\u2015\u2212\u2E3A\u2E3B])/;

    string = string.replace(/[\xA0\r\n\s]+/g, " ");
    string = string.replace(/^\s+/, "");
    string = string.replace(/\s+$/, "");
    string = string.replace(/ : /g, ": ");
    if (!string) return "";

    // Remove HTML tags but remember their positions
    let htmlTags = [];
    let cleanedString = string.replace(/<[^>]+>/g, (match, offset) => {
        htmlTags.push({ match, offset });
        return "";
    });

    // split words
    var words = cleanedString.split(delimiterRegexp);
    var isUpperCase = cleanedString.toUpperCase() == cleanedString;

    var newString = "";
    var delimiterOffset = words[0].length;
    var lastWordIndex = words.length-1;
    var previousWordIndex = -1;
    for(var i=0; i<=lastWordIndex; i++) {
        // Only do manipulation if not a delimiter character
        if(words[i].length != 0 && (words[i].length != 1 || !delimiterRegexp.test(words[i]))) {
            var upperCaseVariant = words[i].toUpperCase();
            var lowerCaseVariant = words[i].toLowerCase();

            // Only use if word does not already possess some capitalization
            if(isUpperCase || words[i] == lowerCaseVariant) {
                if(
                    // a skip word
                    skipWords.indexOf(lowerCaseVariant.replace(/[^a-zA-Z]+/, "")) != -1
                        // not first or last word
                        && i != 0 && i != lastWordIndex
                        // does not follow a colon
                        && (previousWordIndex == -1 || words[previousWordIndex][words[previousWordIndex].length-1].search(/[:\?!]/)==-1)
                ) {
                    words[i] = lowerCaseVariant;
                } else {
                    // This is not a skip word or comes after a colon;
                    // we must capitalize
                    // handle punctuation in the beginning, including multiple, as in "¿Qué pasa?"		
                    var punct = words[i].match(/^[\'\"¡¿“‘„«\s]+/);
                    punct = punct ? punct[0].length+1 : 1;
                    words[i] = words[i].length ? words[i].substr(0, punct).toUpperCase() +
                        words[i].substr(punct).toLowerCase() : words[i];
                }
            }

            previousWordIndex = i;
        }

        newString += words[i];
    }

    // Reinsert HTML tags into their original positions
    htmlTags.forEach(tag => {
        newString = newString.substring(0, tag.offset) + tag.match + newString.substring(tag.offset);
    });

    return newString;
}
