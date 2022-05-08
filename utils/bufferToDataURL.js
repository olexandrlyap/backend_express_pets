const bufferToDataURL = (buffer, mimeType) => {
    const base64String = buffer.toString('base64');
    return `data:${mimeType};base64,${base64String}`;
}


module.exports = bufferToDataURL