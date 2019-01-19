This Project uses Semantic Versioning. More information can be found [here](https://semver.org/).

The branch and tag names also follow the following convention:
- branches: ```v-x.y.z```
- tags: ```v.x.y.z```

You only need to follow this convention when creating a Pull Request for a full npm release.

Please make sure your branch passes the build process by running ```npm test```. 
You can check the code coverage by generating a html report using ```npm run test-coverage```.

The tslint setting may seem harsh but they are usually useful to determine problems.
Try to fix as much as possible but I am not contempt on keeping every rule.
Some are a matter of choice after all.

If you want to ensure a proper release, bump the version in the package.json and run ```npm run release-dry```.
This will run all required steps for a successful release like ts-lint, build, test, generating types
and creates a preview of the final package pushed to npm. 
