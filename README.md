Visite: https://fleet-vision-h5b27o44g-marianna-correas-projects.vercel.app/

# Fleet Tracker

Fleet Tracker é uma aplicação de demonstração de monitoramento de veículos em tempo real.
O backend usa Node.js, Express e Socket.io para emitir posições GPS simuladas.
O frontend é React + Vite com Mapbox GL JS para renderizar veículos em um mapa interativo.

## Estrutura do projeto

- `backend/` — servidor Express + Socket.io + simulador de GPS
- `frontend/` — aplicação React com Mapbox e WebSocket
- `.devcontainer/` — configuração do Codespace com Node 20

## Variáveis de ambiente

### Backend
- `PORT` — porta do servidor backend (default `3001`)
- `SUPABASE_URL` — opcional para persistência futura
- `SUPABASE_ANON_KEY` — opcional para persistência futura

### Frontend
- `VITE_MAPBOX_TOKEN` — token público do Mapbox
- `VITE_BACKEND_URL` — URL do backend Socket.io (padrão `http://localhost:3001`)
- `SUPABASE_URL` e `SUPABASE_ANON_KEY` — opcionais para futura integração

## Setup local

1. Instalar dependências:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Copiar exemplos de ambiente:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Adicionar `VITE_MAPBOX_TOKEN` em `frontend/.env`

## Executando no Codespace

No terminal do Codespace, rode:

```bash
npm run start --prefix backend & npm run dev --prefix frontend
```

Em seguida, abra a porta `5173` no browser do Codespace para acessar a interface.

## Endpoints

- `GET /api/vehicles` — retorna o último estado de todos os veículos
- WebSocket: evento `vehicle:update` envia atualizações a cada 2 segundos

## Notas

- O simulador gera 5 veículos dentro de São Paulo com posições e velocidades atualizadas.
- A integração com Supabase está preparada como opcional e pode ser estendida no backend e frontend.
