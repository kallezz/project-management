const genericServerError = e => {
    return new Error.genericServerError(`Unexpected error: ${e}`)
};

module.exports.genericServerError = genericServerError;