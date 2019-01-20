
const promisify = require('util').promisify;
const glob      = promisify(require('glob'));
const del       = require('del');


(async () => {
    try {
        let files = await glob('build/**/*');
        for (let file of files) {
            await del(file);
        }
    } catch (error) {
        console.error(error);
        process.exit(2);
    }
})();

