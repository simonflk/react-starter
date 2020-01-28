/* eslint-env node */
module.exports = function(mode) {
    if (mode === 'production') {
        return '// Production';
    } else if (mode === 'development') {
        return '// Development';
    }
    return '';
};
