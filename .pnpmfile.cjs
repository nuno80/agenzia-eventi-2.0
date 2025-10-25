module.exports = {
  hooks: {
    readPackage(pkg) {
      // Remove better-sqlite3 from optionalDependencies if present
      if (pkg.optionalDependencies && pkg.optionalDependencies['better-sqlite3']) {
        delete pkg.optionalDependencies['better-sqlite3'];
      }
      
      // Remove better-sqlite3 from dependencies if present
      if (pkg.dependencies && pkg.dependencies['better-sqlite3']) {
        delete pkg.dependencies['better-sqlite3'];
      }
      
      return pkg;
    }
  }
};