# pbjs-loader
Webpack loader for protobuf.js

## Usage

#### Installation

```bash
yarn add -D pbjs-loader
```

#### Configuration

```javascript
    module: {
      rules: [
        {
          test: /\.proto$/,
          use: {
            loader: 'pbjs-loader',
            options: {
              create: true,
              encode: true,
              decode: true,
              verify: false,
              convert: true,
              delimited: false,
              beautify: false,
              comments: false,
              wrap: 'commonjs', // by default
              target: 'static-module' // by default
            }
          }
        }
    }
```

Then `require('foobar.proto')`.

See https://github.com/dcodeIO/protobuf.js/blob/master/cli/pbjs.js#L38 for options definitions.


## License

MIT © Jiacheng ZHANG
