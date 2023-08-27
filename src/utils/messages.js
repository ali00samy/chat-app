const generatMessage = (username,text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime(),
    }
}

const generatLocationMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime(),
    }
}

module.exports = {
    generatMessage,
    generatLocationMessage
}