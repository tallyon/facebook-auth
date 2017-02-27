## Usage

```bash
node server.js --sendTokenUrl=localhost:3001/token --redirectUrl=google.pl:80/
```
This will start facebook authorization server that will listen on localhost:3000/auth and redirect to facebook auth dialog.
Upon successfull authorization server will POST the json token to 'sendTokenUrl' with body:

```json
{
    "token": "EADDADADFAEEG3252525vv53v5V3432vRFVABM34"
}
```

User will be then redirected to 'redirectUrl'.

To test you can run this server with command provided in Usage and run token receiving server with

```bash
node index.js
```

which will start second server on port 3001 that will be listening on port 3001 for POST /token and will print received token in the console.
