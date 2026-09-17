import { Hono } from 'hono'
import openApiYaml from '../../openapi.yaml?raw'
import { SWAGGER_CLIENT_ID } from './oauth/metadata'

const app = new Hono()

app.get('/openapi.yaml', (c) =>
  c.body(openApiYaml, 200, {
    'Content-Type': 'application/yaml; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  }),
)

app.get('/swagger', (c) =>
  c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IDHI API documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      .oauth-notice {
        box-sizing: border-box;
        max-width: 1460px;
        margin: 1rem auto 0;
        padding: 0.875rem 1rem;
        border-left: 4px solid #49cc90;
        background: #f0fff4;
        color: #1f5134;
        font: 400 14px/1.4 sans-serif;
      }
    </style>
  </head>
  <body>
    <aside class="oauth-notice" role="note">
      <strong>OAuth sign-in:</strong> Swagger uses PKCE as a public client.
      No client secret is required—leave the <em>Client Secret</em> field blank.
    </aside>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      const ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui',
        oauth2RedirectUrl: window.location.origin + '/swagger/oauth2-redirect.html',
        persistAuthorization: true,
      })

      ui.initOAuth({
        clientId: '${SWAGGER_CLIENT_ID}',
        appName: 'IDHI API documentation',
        usePkceWithAuthorizationCodeGrant: true,
      })
    </script>
  </body>
</html>`),
)

app.get('/swagger/oauth2-redirect.html', (c) =>
  c.html(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>OAuth callback</title></head>
  <body>
    <script>
      const oauth = window.opener && window.opener.swaggerUIRedirectOauth2

      if (oauth) {
        const source = window.location.hash.match(/(?:code|token|error)/)
          ? window.location.hash.slice(1).replace('?', '&')
          : window.location.search.slice(1)
        const response = Object.fromEntries(new URLSearchParams(source))
        const isValid = response.state === oauth.state

        if (!isValid) {
          oauth.errCb({
            authId: oauth.auth.name,
            source: 'auth',
            level: 'warning',
            message: 'Authorization may be unsafe: state did not match',
          })
        }

        if (response.code) {
          delete oauth.state
          oauth.auth.code = response.code
          oauth.callback({ auth: oauth.auth, redirectUrl: oauth.redirectUrl })
        } else {
          const description = response.error
            ? '[' + response.error + ']: ' + (response.error_description || 'no authorization code received')
            : '[Authorization failed]: no authorization code received'
          oauth.errCb({
            authId: oauth.auth.name,
            source: 'auth',
            level: 'error',
            message: description,
          })
        }
      }

      window.close()
    </script>
  </body>
</html>`),
)

export default app
