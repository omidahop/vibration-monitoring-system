module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'],
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          require('cssnano')({
            preset: [
              'advanced',
              {
                discardComments: {
                  removeAll: true,
                },
                reduceIdents: false,
                zindex: false,
              },
            ],
          }),
        ]
      : []),
  ],
};