## Endpoints

Server runs two endpoints: GET /auth and GET /callback.
GET /auth should be called to redirect to facebook auth dialog.
GET /callback is used only when redirectUrl command line argument is not provided and it will receive callback with token from facebook auth dialog.

## Usage

```bash
node server.js --redirectUrl=localhost:3000/callback
```
This will start facebook authorization server that will listen on localhost:3000/auth and redirect to facebook auth dialog.
Upon successful authorization Facebook auth dialog will callback to url provided in redirectUrl with token in url query like this:

```
    http://localhost:3000/callback?code=AQC10vNLJVtvAT5pk1rbz1zvx5yqd7YzxaE52XVpe8Y2j6QElF3WyaIcvGTZoc-MkS6agQLxvJLEipJVTiwa29N6Q8k0-yERh1yzitT1zJ93wnWpP0NRqTYElN6Y4eyJnoosu8xkNiI4C8k4kXj3vCSdQ09BBS5m2UbqjKnKAlBlvT7fVEDn-viMb2Y5MTliTRhzMgizaN64EZZdARD1v85FygLt8VttUWqP01lsr5DNuyZTzfgjcnTv1LFoT-Mt7nAEOx0JLymSTAfrhyHWRkqDQLhKpU4p4WfRX3ZSG9CZk5KRBR71Y4J#_=_
```

## Config
Config file can be found in /config/default.json
