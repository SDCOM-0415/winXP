module.exports = function override(config, env) {
  if (config.output) {
    config.output.filename = 'static/js/[name].js';
    config.output.chunkFilename = 'static/js/[name].chunk.js';
    config.output.assetModuleFilename = 'static/media/[name][ext]';
  }

  if (Array.isArray(config.plugins)) {
    config.plugins.forEach(plugin => {
      if (
        plugin.constructor &&
        plugin.constructor.name === 'MiniCssExtractPlugin' &&
        plugin.options
      ) {
        plugin.options.filename = 'static/css/[name].css';
        plugin.options.chunkFilename = 'static/css/[name].chunk.css';
      }
      if (
        plugin.constructor &&
        plugin.constructor.name === 'HtmlWebpackPlugin' &&
        plugin.options
      ) {
        plugin.options.hash = true;
      }
    });
  }

  const stripName = name =>
    typeof name === 'string' && name.includes('[hash')
      ? 'static/media/[name].[ext]'
      : name;

  const walkRules = rules => {
    rules.forEach(rule => {
      if (Array.isArray(rule.oneOf)) walkRules(rule.oneOf);
      if (Array.isArray(rule.rules)) walkRules(rule.rules);
      if (rule.options && rule.options.name) {
        rule.options.name = stripName(rule.options.name);
      }
      if (rule.generator && typeof rule.generator.filename === 'string') {
        rule.generator.filename = stripName(rule.generator.filename);
      }
      if (Array.isArray(rule.use)) {
        rule.use.forEach(u => {
          if (u && u.options && u.options.name) {
            u.options.name = stripName(u.options.name);
          }
        });
      }
    });
  };

  if (config.module && Array.isArray(config.module.rules)) {
    walkRules(config.module.rules);
  }

  return config;
};
