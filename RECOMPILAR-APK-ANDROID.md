# 🔧 Como Recompilar o APK do Android

## Problema Identificado
O Android por padrão bloqueia conexões HTTP (não-HTTPS) por segurança. Como estamos usando `http://192.168.15.3:3001` (HTTP local), precisamos permitir explicitamente.

## O que foi Corrigido
✅ Adicionado `network_security_config.xml` para permitir HTTP em:
   - `192.168.15.3` (seu PC)
   - `localhost` 
   - `10.0.2.2` (emulador Android)

✅ Atualizado `AndroidManifest.xml` com:
   - `android:networkSecurityConfig`
   - `android:usesCleartextTraffic="true"`

## Passos para Recompilar o APK

### 1. Build do Frontend (em andamento...)
```bash
cd src/jurisconnect-frontend
npm run build
```

### 2. Sincronizar com Capacitor
```bash
npx cap sync android
```

### 3. Abrir no Android Studio
```bash
npx cap open android
```

### 4. No Android Studio:
1. Aguarde o Gradle terminar de sincronizar
2. Clique em **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Aguarde a compilação (pode levar alguns minutos)
4. Quando aparecer "APK(s) generated successfully", clique em **locate**

### 5. Instalar no Celular
1. Copie o APK gerado para o celular (via USB, email, ou WhatsApp)
2. **IMPORTANTE:** Desinstale o app antigo primeiro
3. Instale o novo APK
4. Tente fazer login

## Alternativa Rápida (Se não tiver Android Studio)

### ⚠️ Requisito: Java Development Kit (JDK)
Se aparecer erro "JAVA_HOME is not set", você precisa instalar o JDK:
1. Baixe: https://www.oracle.com/java/technologies/downloads/#java17
2. Ou instale o Android Studio que já vem com tudo

### Opção 1: Usar o Gradle direto
```bash
cd src/jurisconnect-frontend/android
./gradlew assembleDebug
```
APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

### Opção 2: Usar a Versão Web no Celular (RECOMENDADO AGORA)
Enquanto o APK não fica pronto, pode usar no navegador do celular:
`http://192.168.15.3:5173`

**Vantagens:**
- ✅ Funciona imediatamente  
- ✅ Não precisa compilar APK
- ✅ Mesma funcionalidade
- ✅ Atualiza automaticamente quando você mexer no código

## Verificação Pós-Instalação
Após instalar o novo APK:
1. Abra o app
2. Tente fazer login com: `admin@admin.com` / senha que você usa
3. Deve funcionar agora! ✅

## Se Ainda Não Funcionar
Me avise qual erro aparece, mas agora deveria funcionar porque:
- ✅ Backend está acessível (testamos)
- ✅ Configuração de rede está correta
- ✅ Permissões HTTP estão liberadas
