const fs        =  require('fs-extra');
const promisify = require('util').promisify;
const glob      = promisify(require('glob'));

(async () => {
    try {
        let files = await glob('build/src/**/*.d.ts');
        console.log(files);
        for (let file of files) {
            await fs.copy(file, file.replace('build/src', 'types'), {overwrite: true});
        }
    } catch (error) {
        console.error(error);
        process.exit(2);
    }
})();

