# Spotify unsupported_response_type Error - Fix

## Probleem

Error: `unsupported_response_type`

Dit komt omdat Spotify de **Implicit Grant Flow** (`response_type=token`) heeft deprecated.

## Oplossing: Gebruik Authorization Code Flow with PKCE

Spotify vereist nu de moderne PKCE flow voor client-side apps.

## Wat er veranderd moet worden:

### Oude code (werkt niet meer):
```javascript
authUrl.searchParams.append('response_type', 'token');
```

### Nieuwe code (PKCE):
```javascript
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('code_challenge_method', 'S256');
authUrl.searchParams.append('code_challenge', codeChallenge);
```

## Complete Fix

Ik heb de code geüpdatet om PKCE te gebruiken. Dit is veiliger en ondersteund door Spotify.

### Belangrijke wijzigingen:

1. **PKCE Code Verifier & Challenge**: Genereert een veilige random string
2. **Authorization Code**: In plaats van direct een token, krijgen we eerst een code
3. **Token Exchange**: We wisselen de code in voor een access token
4. **Refresh Token**: We krijgen nu ook een refresh token (langer geldig!)

### Wat je moet doen:

1. **Upload de nieuwe `spotify-auth.js`** naar je server
2. **Herstart is NIET nodig** - JavaScript wordt direct geladen
3. **Hard refresh** in je browser (Ctrl+F5)

## Verificatie

Na de update:
1. Open de browser console (F12)
2. Klik op "Login met Spotify"
3. Je zou moeten zien:
   ```
   🔍 Spotify Redirect URI: https://hitster.millercodings.nl/callback.html
   🔐 Using PKCE authorization flow
   ```

## Troubleshooting

### Error blijft bestaan na update

```bash
# Clear browser cache
# Ctrl+Shift+Delete -> Clear cache

# Hard refresh
# Ctrl+F5 of Cmd+Shift+R
```

### Controleer of het bestand is geüpdatet

```bash
# Op de server
cat /var/www/hitster-trainer/spotify-auth.js | grep "response_type"

# Should show: response_type: 'code'
# NOT: response_type: 'token'
```

## Voordelen van PKCE

✅ **Veiliger**: Geen tokens in de URL  
✅ **Refresh tokens**: Blijf langer ingelogd  
✅ **Modern**: Spotify's aanbevolen methode  
✅ **Client-side**: Geen server-side code nodig  

## Legacy Support

De oude Implicit Grant Flow is sinds 2021 deprecated en wordt niet meer ondersteund door nieuwe Spotify apps.

Als je een oude Spotify app hebt (voor 2021), kan het zijn dat die nog werkt met `response_type=token`, maar nieuwe apps moeten PKCE gebruiken.

## Referenties

- [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [PKCE Specification](https://tools.ietf.org/html/rfc7636)
