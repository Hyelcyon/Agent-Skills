function readPackage(pkg) {
  if (pkg.name === 'example-legacy-tool' && pkg.peerDependencies) {
    delete pkg.peerDependencies['react'];
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
