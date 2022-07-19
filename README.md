# config
This framework supports loading configuration according to the environment and defining configuration files of multiple environments. For more details, please check env.

config
|- config.default.js
|- config.prod.js
|- config.test.js
|- config.local.js

configure mysql connection 
```js
'use strict';

module.exports = {
  mysql: {
    clients: {
      history: {
        host: '',
        port: '',
        user: '',
        password: '',
        database: 'history_yield',
      },
      yield: {
        host: '',
        port: '',
        user: '',
        password: '',
        database: 'yield',
      },
    },
    default: {

    },
    // Whether to load to app, enabled by default
    app: true,
    // Whether to load the file to the Agent. The default value is disabled
    agent: false,
  }
};
```

# toeknyield

Tokenyield history processing logic

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:5051/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org