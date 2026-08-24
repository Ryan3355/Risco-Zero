# Checklist Diário de Segurança

## Acesso pelo QR Code via HTTP

O QR Code precisa apontar para um endereço que o celular consiga alcançar. Abra
o checklist por HTTP — e não diretamente pelo arquivo `index.html` — usando o
servidor incluído:

```bash
python3 serve.py --host 0.0.0.0 --port 8080
```

Descubra o IP da máquina do totem na rede e abra, nela, por exemplo,
`http://192.168.1.20:8080`. Ao selecionar **Acessar pelo celular**, o QR Code
usará esse endereço. O celular deve estar na mesma rede Wi-Fi/intranet e a porta
`8080` deve estar liberada no firewall.

### Endereço com `www`

Para usar um domínio, como `https://www.exemplo.com`, configure o DNS e o
servidor web/reverse proxy da sua organização para encaminhar esse domínio para
esta aplicação. Em seguida, informe o endereço público ao iniciar o servidor:

```bash
python3 serve.py --host 0.0.0.0 --port 8080 --public-url https://www.exemplo.com
```

Assim, mesmo que o totem esteja aberto por um IP interno, o QR Code sempre
codifica `https://www.exemplo.com`. O servidor aceita apenas URLs `http://` ou
`https://` completas nesse parâmetro.

> Para produção, prefira `https://` no domínio público. O servidor incluído é
> adequado para rede interna e demonstrações; use o servidor web gerenciado pela
> organização para exposição pública, certificados TLS e controles de acesso.
