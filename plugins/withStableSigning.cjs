const { withAppBuildGradle } = require("expo/config-plugins");
module.exports = (config) =>
  withAppBuildGradle(config, (config) => {
    const marker = "// TIME80_STABLE_SIGNING";
    if (!config.modResults.contents.includes(marker))
      config.modResults.contents += `
${marker}
def time80SigningNames = ['TIME80_KEYSTORE_PATH', 'TIME80_KEYSTORE_PASSWORD', 'TIME80_KEY_ALIAS', 'TIME80_KEY_PASSWORD']
def time80SigningReady = time80SigningNames.every { System.getenv(it) }
android.buildTypes.release.signingConfig = null
if (time80SigningReady) {
    android.signingConfigs.create('time80Release') {
        storeFile file(System.getenv('TIME80_KEYSTORE_PATH'))
        storePassword System.getenv('TIME80_KEYSTORE_PASSWORD')
        keyAlias System.getenv('TIME80_KEY_ALIAS')
        keyPassword System.getenv('TIME80_KEY_PASSWORD')
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.time80Release
}
gradle.taskGraph.whenReady { graph ->
    if (graph.allTasks.any { it.project == project && it.name.toLowerCase().contains('release') } && !time80SigningReady) {
        throw new GradleException('Time80 release requires the existing stable signing identity; debug signing is forbidden.')
    }
}
`;
    return config;
  });
