module.exports = (apacheData) => {
    const months = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
        "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
    }

    const parts = apacheData.split(/\/|:| /);
    const day = parts[0];
    const month = months[parts[1]];
    const year = parts[2];
    const time = `${parts[3]}:${parts[4]}:${parts[5]}`;

    return `${year}-${month}-${day} ${time}`;
}
