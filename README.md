# flocki-web-app

Vue 3 client for the Flocki church API.

Local development needs Node.js 22 or newer. The Docker image builds with the Node 24 LTS image. `npm run dev` calls the API at `http://localhost:8001`, which is the port published by the `flocki-api` compose file. Set `VITE_API_BASE_URL` to point somewhere else.

```sh
npm install
npm run dev
npm run build
npm run test:unit
npm run lint
```

The nginx image reads `APP_API_PROTOCOL`, `APP_API_URL`, and `APP_API_PORT` when the container starts and writes them into `env-config.js`. `.env` gives the image build those names. Compose overrides them so a browser on the host reaches the API at `localhost:8001`.

```sh
docker build -t flocki-web-app .
```

Start Postgres, the API, and this image from the `flocki-api` compose file.
