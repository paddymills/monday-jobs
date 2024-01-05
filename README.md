# Monday.com Jobs update

## Building
```
npm install
npm run build
```

## Development

There are 2 ways of testing. This can be run local to just test the UI or it can be run within Monday's apps structure.

In both cases, you need to first run
```
npm run dev
```

### Apps structure
Requires the [monday-apps-cli](https://developer.monday.com/apps/docs/monday-code-cli) to be set up to create tunnel to the app framework.

In a different terminal window, run
```
mapps tunnel:create --port 5173 --appId {monday app id}
```

## Deploy
Requires the [monday-apps-cli](https://developer.monday.com/apps/docs/monday-code-cli) to be set up to push the code

```
npm run build
mapps code:push -d dist -i {app version id}
```
